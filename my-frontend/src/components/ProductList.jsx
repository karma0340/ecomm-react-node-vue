import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

function renderStars(rating = 0) {
  const stars = [];
  let i = 0;
  for (; i < Math.floor(rating); i++) {
    stars.push(
      <svg width="18" height="18" className="text-warning" key={`star-full-${i}`}>
        <use xlinkHref="#star-full" />
      </svg>
    );
  }
  if (rating - Math.floor(rating) >= 0.5) {
    stars.push(
      <svg width="18" height="18" className="text-warning" key="star-half">
        <use xlinkHref="#star-half" />
      </svg>
    );
  }
  return stars;
}

function ProductList({ onCartUpdate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Store refs to quantity inputs
  const quantityRefs = useRef({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:3000/api/products?page=${page}&limit=${limit}`)
      .then(res => {
        setProducts(res.data.products || []);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load products');
        setLoading(false);
      });
  }, [page]);

  const getImageSrc = (prod) => {
    if (!prod.imageUrl) return '/images/default-product.jpg';
    if (prod.imageUrl.startsWith('http')) return prod.imageUrl;
    return `http://localhost:3000${prod.imageUrl}`;
  };

  // Add to Cart handler
  const handleAddToCart = async (productId, idx) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add items to your cart.');
      return;
    }
    const quantity = quantityRefs.current[idx]?.value || 1;
    try {
      await axios.post(
        'http://localhost:3000/api/cart',
        { productId, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product added to cart!');
      if (onCartUpdate) onCartUpdate(); // Refresh cart count in header
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add to cart!'
      );
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!products.length) return <div>No products found.</div>;

  return (
    <section className="pb-5">
      <div className="container-lg">
        <div className="row">
          <div className="col-md-12">
            <div className="section-header d-flex flex-wrap justify-content-between my-4">
              <h2 className="section-title">Best selling products</h2>
              <div className="d-flex align-items-center">
                <a href="/products" className="btn btn-primary rounded-1">
                  View All
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="product-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xl-4 row-cols-xxl-5">
              {products.map((p, idx) => (
                <div className="col" key={p.id || idx}>
                  <div className="product-item">
                    <figure>
                      <a href={`/product/${p.id}`} title={p.name}>
                        <img src={getImageSrc(p)} alt={p.name + ' Thumbnail'} className="tab-image" />
                      </a>
                    </figure>
                    <div className="d-flex flex-column text-center">
                      <h3 className="fs-6 fw-normal">{p.name}</h3>
                      <div>
                        <span className="rating">{renderStars(p.rating || 0)}</span>
                        <span>{p.reviews }</span>
                      </div>
                      <div className="d-flex justify-content-center align-items-center gap-2">
                        <del>{p.old_price || ''}</del>
                        <span className="text-dark fw-semibold">₹{p.price}</span>
                        <span className="badge border border-dark-subtle rounded-0 fw-normal px-1 fs-7 lh-1 text-body-tertiary">
                          {p.discount || ''}
                        </span>
                      </div>
                      <div className="button-area p-3 pt-0">
                        <div className="row g-1 mt-2">
                          <div className="col-3">
                            <input
                              type="number"
                              name="quantity"
                              className="form-control border-dark-subtle input-number quantity"
                              defaultValue={1}
                              min={1}
                              ref={el => (quantityRefs.current[idx] = el)}
                              aria-label="Quantity"
                            />
                          </div>
                          <div className="col-7">
                            <button
                              type="button"
                              className="btn btn-primary rounded-1 p-2 fs-7 btn-cart w-100"
                              onClick={() => handleAddToCart(p.id, idx)}
                            >
                              <svg width="18" height="18">
                                <use xlinkHref="#cart" />
                              </svg>{' '}
                              Add to Cart
                            </button>
                          </div>
                          <div className="col-2">
                            <button type="button" className="btn btn-outline-dark rounded-1 p-2 fs-6 w-100" aria-label="Add to Wishlist">
                              <svg width="18" height="18">
                                <use xlinkHref="#heart" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination Controls */}
            <div className="pagination mt-4 d-flex justify-content-center align-items-center">
              <button
                className="btn btn-outline-primary"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Prev
              </button>
              <span className="mx-3">Page {page} of {totalPages}</span>
              <button
                className="btn btn-outline-primary"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProductList;

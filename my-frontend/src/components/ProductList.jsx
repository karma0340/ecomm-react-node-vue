import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';

// Utility: Render rating stars (unchanged)
function renderStars(rating = 0) {
  const stars = [];
  for (let i = 0; i < Math.floor(rating); i++) {
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

function ProductList({ onCartUpdate, subcategoryId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const quantityRefs = useRef({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    let url = `http://localhost:3000/api/products?page=${page}&limit=${limit}`;
    if (subcategoryId) url += `&subcategoryId=${subcategoryId}`;
    axios
      .get(url)
      .then(res => {
        let prods = [];
        if (Array.isArray(res.data)) {
          prods = res.data;
        } else if (Array.isArray(res.data.products)) {
          prods = res.data.products;
        }
        setProducts(prods);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load products');
        setLoading(false);
      });
  }, [page, subcategoryId]);

  const getImageSrc = (prod) => {
    if (!prod.imageUrl) return '/images/default-product.jpg';
    if (prod.imageUrl.startsWith('http')) return prod.imageUrl;
    return `http://localhost:3000${prod.imageUrl}`;
  };

  const handleAddToCart = async (productId, idx) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add items to your cart.');
      return;
    }
    const quantity = quantityRefs.current[idx]?.value || 1;
    try {
      await axios.post(
        'http://localhost:3000/api/cart/items',
        { productId, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product added to cart!');
      if (onCartUpdate) onCartUpdate();
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add to cart!'
      );
    }
  };

  const handleAddToWishlist = async (productId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add items to your wishlist.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:3000/api/wishlist/items',
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Product added to wishlist!');
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add to wishlist!'
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
            <div className="product-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xl-4 row-cols-xxl-5">
              {products.map((p, idx) => {
                const isOutOfStock = !p.stock || Number(p.stock) <= 0;
                return (
                  <div className="col" key={p.id || idx}>
                    <div
                      className={`product-item${isOutOfStock ? ' out-of-stock' : ''}`}
                      style={{
                        opacity: isOutOfStock ? 0.6 : 1,
                        background: isOutOfStock ? '#f1f3f6' : '#fff',
                        filter: isOutOfStock ? 'grayscale(0.4)' : 'none',
                        pointerEvents: isOutOfStock ? 'auto' : 'auto', // still allow Wishlist, just disable button state
                        transition: 'all 0.2s'
                      }}
                    >
                      <figure>
                        <a href={`/product/${p.id}`} title={p.name}>
                          <img src={getImageSrc(p)} alt={p.name + ' Thumbnail'} className="tab-image" />
                        </a>
                      </figure>
                      <div className="d-flex flex-column text-center">
                        <h3 className="fs-6 fw-normal" style={{ color: isOutOfStock ? '#888' : undefined }}>
                          {p.name}
                        </h3>
                        <div>
                          <span className="rating">{renderStars(p.rating || 0)}</span>
                          <span>{p.reviews}</span>
                        </div>
                        <div className="d-flex justify-content-center align-items-center gap-2">
                          <del>{p.old_price || ''}</del>
                          <span className="text-dark fw-semibold">₹{p.price}</span>
                          <span className="badge border border-dark-subtle rounded-0 fw-normal px-1 fs-7 lh-1 text-body-tertiary">
                            {p.discount || ''}
                          </span>
                        </div>
                        <div className="stock-status mt-1 mb-1">
                          <span className={`badge px-2 bg-${isOutOfStock ? 'secondary' : 'success'}`}>
                            {isOutOfStock ? 'Out of stock' : `In stock: ${p.stock}`}
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
                                disabled={isOutOfStock}
                              />
                            </div>
                            <div className="col-7">
                              <button
                                type="button"
                                className="btn btn-primary rounded-1 p-2 fs-7 btn-cart w-100"
                                onClick={() => handleAddToCart(p.id, idx)}
                                disabled={isOutOfStock}
                                style={{
                                  opacity: isOutOfStock ? 0.7 : 1,
                                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <svg width="18" height="18">
                                  <use xlinkHref="#cart" />
                                </svg>{' '}
                                {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                              </button>
                            </div>
                            <div className="col-2">
                              <button
                                type="button"
                                className="btn btn-outline-dark rounded-1 p-2 fs-6 w-100"
                                aria-label="Add to Wishlist"
                                onClick={() => handleAddToWishlist(p.id)}
                                disabled={isOutOfStock}
                                style={{
                                  opacity: isOutOfStock ? 0.7 : 1,
                                  cursor: isOutOfStock ? 'not-allowed' : 'pointer'
                                }}
                              >
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
                );
              })}
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
      {/* SVG symbols for stars and icons (insert in root app or layout for best performance) */}
      <svg style={{ display: 'none' }}>
        <symbol id="star-full" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.3l6.2 3.7-1.6-7 5.4-4.6-7-.6L12 2 9 8.8l-7 .6 5.4 4.6-1.6 7z"/></symbol>
        <symbol id="star-half" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.3l6.2 3.7-1.6-7 5.4-4.6-7-.6L12 2z"/></symbol>
        <symbol id="cart" viewBox="0 0 24 24"><path fill="currentColor" d="M7.6 18C6.7 18 6 18.7 6 19.5S6.7 21 7.6 21s1.6-.7 1.6-1.5-.7-1.5-1.6-1.5zm8.8 0c-.9 0-1.6.7-1.6 1.5s.7 1.5 1.6 1.5 1.6-.7 1.6-1.5-.7-1.5-1.6-1.5zM7 17.2c-1 0-1.6-1-1.4-2l1-7c.2-.9 1-1.6 1.9-1.8l7.1-1c.1 0 .2.1.2.2L16 5l1.8.3-.2 1.2c-.4 2.2-2 5.7-2.3 6.2-.2.4-.5.6-.9.6H9.9c-.5 0-.8-.4-.9-.8L9 10.3c-.1-.5-.3-1.5-.1-2 .2-.6.6-.9 1.2-1.1l.3-.3c.1-.2.3-.2.4-.2l7.1 1c1.2.1 2.3 1.1 2.5 2.3L21 12.3c0 .2-.2.3-.4.3h-15zm12.2-8.6l-1-4.3c-.2-.7-.9-1.2-1.7-1.2H7.6c-.8 0-1.5.5-1.7 1.2l-1 4.3C4.7 8 5.3 8.5 6 8.5h12c.7 0 1.3-.5 1.4-1.1z"/></symbol>
        <symbol id="heart" viewBox="0 0 24 24"><path fill="currentColor" d="M12.1 4.6C10.8 2.7 7.6 2.5 6 5c-.7 1-1 2.2-.6 3.2.5 1.3 2.2 2.6 3.7 4.5l1.6 2.1 1.6-2.1c1.5-1.9 3.2-3.2 3.7-4.5.4-1 .1-2.2-.6-3.2-1.6-2.5-4.8-2.3-6.1 0z"/></symbol>
      </svg>
    </section>
  );
}

export default ProductList;

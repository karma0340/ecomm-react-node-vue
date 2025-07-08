import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const quantityRef = useRef();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:3000/api/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load product');
        setLoading(false);
      });
  }, [id]);

  const getImageSrc = (prod) => {
    if (!prod.imageUrl) return '/images/default-product.jpg';
    if (prod.imageUrl.startsWith('http')) return prod.imageUrl;
    return `http://localhost:3000${prod.imageUrl}`;
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to add items to your cart.');
      return;
    }
    const quantity = quantityRef.current?.value || 1;
    try {
      await axios.post(
        'http://localhost:3000/api/cart/items',
        { productId: product.id, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback('Product added to cart!');
      setTimeout(() => setFeedback(''), 1500);
    } catch (err) {
      setFeedback(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add to cart!'
      );
      setTimeout(() => setFeedback(''), 2000);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart'); // or '/checkout' if you have a checkout page
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading product...</div>;
  if (error) return <div style={{ color: 'red', padding: 40, textAlign: 'center' }}>{error}</div>;
  if (!product) return null;

  return (
    <div className="container-lg py-5">
      <div className="row">
        <div className="col-md-5 text-center">
          <img
            src={getImageSrc(product)}
            alt={product.name}
            style={{ maxWidth: 350, borderRadius: 8, background: '#fafafa' }}
          />
        </div>
        <div className="col-md-7">
          <h1>{product.name}</h1>
          <div>
            <span className="rating">{renderStars(product.rating || 0)}</span>
            <span className="ms-2">{product.reviews} reviews</span>
          </div>
          <div className="my-2">
            <del>{product.old_price ? `₹${product.old_price}` : ''}</del>
            <span className="fs-4 fw-bold ms-2">₹{product.price}</span>
            {product.discount && (
              <span className="badge bg-warning text-dark ms-2">{product.discount}</span>
            )}
          </div>
          <p className="text-muted">{product.description}</p>
          <div className="d-flex align-items-center gap-2 mb-3">
            <label htmlFor="quantity" className="me-2">Quantity:</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-control"
              style={{ width: 80 }}
              defaultValue={1}
              min={1}
              ref={quantityRef}
            />
          </div>
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-primary" onClick={handleAddToCart}>
              Add to Cart
            </button>
            <button className="btn btn-warning" onClick={handleBuyNow}>
              Buy Now
            </button>
          </div>
          {feedback && <div className="alert alert-info py-2">{feedback}</div>}
          <div className="mt-4">
            <div>🚚 Free delivery on orders over ₹499</div>
            <div>🔄 7-day easy returns</div>
            <div>🔒 Secure payment</div>
          </div>
        </div>
      </div>
    </div>
  );
}

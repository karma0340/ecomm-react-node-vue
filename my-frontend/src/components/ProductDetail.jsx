import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

function renderStars(rating = 0) {
  const stars = [];
  let i = 0;
  for (; i < Math.floor(rating); i++) {
    stars.push(
      <svg width="20" height="20" className="text-warning" key={`star-full-${i}`}>
        <use xlinkHref="#star-full" />
      </svg>
    );
  }
  if (rating - Math.floor(rating) >= 0.5) {
    stars.push(
      <svg width="20" height="20" className="text-warning" key="star-half">
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
      setFeedback('Please log in to add items to your cart.');
      setTimeout(() => setFeedback(''), 2000);
      return;
    }
    const quantity = quantityRef.current?.value || 1;
    try {
      await axios.post(
        'http://localhost:3000/api/cart/items',
        { productId: product.id, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFeedback('✅ Product added to cart!');
      setTimeout(() => setFeedback(''), 1700);
    } catch (err) {
      setFeedback(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add to cart!'
      );
      setTimeout(() => setFeedback(''), 2200);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    setTimeout(() => navigate('/cart'), 800); // animate then move
  };

  // Framer variants
  const outerFade = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 40 },
    transition: { duration: 0.4, type: 'spring' }
  };
  const imgAnim = {
    initial: { opacity: 0, scale: 0.9, x: 70 },
    animate: { opacity: 1, scale: 1, x: 0 },
    transition: { duration: 0.54, type: 'spring' }
  };
  const detailFade = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.42, type: 'spring' }
  };
  const priceAnim = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: 'spring', duration: 0.34 }
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: 'center' }}>
      <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }}>Loading product...</motion.span>
    </div>
  );
  if (error) return (
    <div style={{ color: 'red', padding: 40, textAlign: 'center' }}>
      <motion.span initial={{ scale: 0.93 }} animate={{ scale: [0.93, 1.03, 1] }} transition={{ duration: 0.69 }}>❌ {error}</motion.span>
    </div>
  );
  if (!product) return null;

  return (
    <motion.div
      className="container-lg py-5"
      {...outerFade}
    >
      <div className="row">
        <motion.div className="col-md-5 text-center" {...imgAnim}>
          <motion.img
            src={getImageSrc(product)}
            alt={product.name}
            style={{
              maxWidth: 360,
              width: "100%",
              borderRadius: 12,
              background: '#fafafa',
              boxShadow: '0 10px 60px #21308913, 0 1.5px 18px #915a7222',
              objectFit: "cover"
            }}
            initial={{ opacity: 0.8, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, type: "spring" }}
            whileHover={{ scale: 1.02, boxShadow: '0 16px 64px #537a49aa' }}
          />
        </motion.div>
        <motion.div className="col-md-7 px-4 pt-4 pt-md-0" {...detailFade}>
          <h1 style={{ fontWeight: 700, fontSize: '2.2rem', color: "#222" }}>{product.name}</h1>
          <div className="align-items-center d-flex mb-2">
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.21 }}
              className="rating"
              style={{ marginTop: 2, fontSize: "1.27em" }}
            >
              {renderStars(product.rating || 0)}
            </motion.span>
            <span className="ms-2 text-secondary">{product.reviews} reviews</span>
          </div>
          <motion.div className="my-2 d-flex align-items-baseline gap-3" {...priceAnim}>
            <del className="fs-5" style={{ color: "#d55" }}>{product.old_price ? `₹${product.old_price}` : ''}</del>
            <span className="fs-3 fw-bold" style={{
              color: "#37b71e",
              background: "linear-gradient(90deg,#f2ffe0,#dceed0)",
              borderRadius: "16px",
              padding: "0 14px"
            }}>
              ₹{product.price}
            </span>
            {product.discount && (
              <span className="badge bg-warning text-dark ms-2 fw-bold">{product.discount}</span>
            )}
          </motion.div>
          <motion.p
            className="text-muted mt-2 mb-4"
            initial={{ opacity: 0, y: 11 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.11, duration: 0.32 }}
          >
            {product.description}
          </motion.p>
          <div className="d-flex align-items-center gap-2 mb-3">
            <label htmlFor="quantity" className="me-2 fs-6 fw-semibold">Quantity:</label>
            <motion.input
              type="number"
              id="quantity"
              name="quantity"
              className="form-control border"
              style={{ width: 90, padding: "8px 6px", fontSize: "1.1em", borderRadius: 8 }}
              defaultValue={1}
              min={1}
              ref={quantityRef}
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
            />
          </div>
          <div className="d-flex gap-2 mb-3 flex-wrap">
            <motion.button
              className="btn btn-primary px-4 py-2 fw-bold"
              onClick={handleAddToCart}
              whileHover={{ scale: 1.06, backgroundColor: "#299c12" }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 17 }}
            >
              <svg width="20" height="20" className="me-2" style={{ marginBottom: 2 }}>
                <use xlinkHref="#cart" />
              </svg>
              Add to Cart
            </motion.button>
            <motion.button
              className="btn btn-warning px-4 py-2 fw-bold"
              onClick={handleBuyNow}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 280, damping: 18 }}
              style={{ color: "#222" }}
            >
              <svg width="20" height="20" className="me-2" style={{ marginBottom: 2 }}>
                <use xlinkHref="#lightning" />
              </svg>
              Buy Now
            </motion.button>
          </div>
          <AnimatePresence>
            {feedback && (
              <motion.div
                className={`alert alert-${feedback.includes('added') ? "success" : "info"} py-2`}
                style={{ fontWeight: 500, background: feedback.includes('added')
                  ? "linear-gradient(92deg,#ebfae0,#e7fef8)" : "#dff9fe" }}
                initial={{ opacity: 0, y: -12, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.92 }}
                transition={{ duration: 0.24, type: "spring" }}
              >
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            className="mt-4 border rounded-3 p-3 bg-light"
            style={{
              background: 'linear-gradient(90deg, #f8fff6 77%, #fdfdfd 100%)'
            }}
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.27 }}
          >
            <div><span role="img" aria-label="truck">🚚</span> <b>Free delivery</b> on orders over <b>₹499</b></div>
            <div><span role="img" aria-label="ret">🔄</span> <b>7-day easy returns</b></div>
            <div><span role="img" aria-label="lock">🔒</span> <b>Secure payment</b></div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

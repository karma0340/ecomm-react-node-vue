import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalLoader,  } from './GlobalLoaderContext'; // <<=== IMPORT

// Utility: Render rating stars
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
  const navigate = useNavigate();
  const { show, hide } = useGlobalLoader(); // <<==== USE LOADER

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const quantityRefs = useRef({});

  // For animated feedback
  const [feedbackIdx, setFeedbackIdx] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    show(); // <<== SHOW GLOBAL LOADER!
    let url = `http://localhost:3000/api/products?page=${page}&limit=${limit}`;
    if (subcategoryId) url += `&subcategoryId=${subcategoryId}`;
    axios
      .get(url)
      .then(res => {
        if (!isMounted) return;
        let prods = [];
        if (Array.isArray(res.data)) prods = res.data;
        else if (Array.isArray(res.data.products)) prods = res.data.products;
        setProducts(prods);
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setError('Failed to load products');
        setLoading(false);
      })
      .finally(() => {
        hide(); // <<== HIDE GLOBAL LOADER!
      });
    return () => { isMounted = false; };
    // eslint-disable-next-line
  }, [page, subcategoryId]);

  const getImageSrc = (prod) => {
    if (!prod.imageUrl) return '/images/default-product.jpg';
    if (prod.imageUrl.startsWith('http')) return prod.imageUrl;
    return `http://localhost:3000${prod.imageUrl}`;
  };

  const showFeedback = (msg, idx) => {
    setFeedbackIdx(idx);
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 1600);
  };

  const handleAddToCart = async (productId, idx) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showFeedback('🔐 Login to add', idx);
      return;
    }
    const quantity = quantityRefs.current[idx]?.value || 1;
    show();
    try {
      await axios.post(
        'http://localhost:3000/api/cart/items',
        { productId, quantity: Number(quantity) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showFeedback('✅ Added to cart', idx);
      if (onCartUpdate) onCartUpdate();
    } catch (err) {
      showFeedback(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to add!',
        idx
      );
    } finally {
      hide();
    }
  };

  const handleAddToWishlist = async (productId, idx) => {
    const token = localStorage.getItem('token');
    if (!token) {
      showFeedback('🔐 Login to add', idx);
      return;
    }
    show();
    try {
      await axios.post(
        'http://localhost:3000/api/wishlist/items',
        { productId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showFeedback('❤️ Wishlisted!', idx);
    } catch (err) {
      showFeedback(
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to wishlist!',
        idx
      );
    } finally {
      hide();
    }
  };

  // Animation
  const gridDelay = 0.07;
  const cardAnim = {
    initial: { opacity: 0, scale: 0.97, y: 28 },
    animate: (i) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: 0.07 + i * gridDelay,
        duration: 0.38,
        type: "spring",
        stiffness: 240,
        damping: 20,
      }
    }),
    exit: { opacity: 0, scale: 0.95, y: 28, transition: { duration: 0.15 } }
  };

  if (loading)
    return (
      <motion.div style={{padding: 40, textAlign:"center"}}>
        <motion.span animate={{opacity:[.4,.95,.4]}} transition={{repeat:Infinity,duration:1}}>Loading...</motion.span>
      </motion.div>
    );
  if (error)
    return <div>{error}</div>;
  if (!products.length)
    return <div>No products found.</div>;

  // Card styles
  const productItemStyle = {
    minHeight: 370,
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    background: '#fff',
    borderRadius: 15,
    boxShadow: '0 2px 12px #dae7f312',
    margin: "10px 3px",
    border: "1.2px solid #dee0ee",
    position: "relative",
    overflow: "hidden",
    padding: "0 0 0 0",
    cursor: "pointer",
    transition: "box-shadow 0.2s"
  };
  const imageWrapStyle = {
    width: "100%",
    aspectRatio: "1/1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1em",
    background: "#f7fafd"
  };
  const imageStyle = {
    maxHeight: 160,
    maxWidth: "100%",
    width: "auto",
    height: "auto",
    objectFit: "contain",
    borderRadius: 10,
    background: "#f5f7fa",
    margin: "0 auto"
  };
  const contentStyle = {
    flex: "1 1 auto",
    display: "flex",
    flexDirection: "column",
    gap: 5,
    justifyContent: "flex-start",
    padding: "10px 10px 4px 10px"
  };
  const bottomAreaStyle = {
    padding: "12px 12px 9px 12px",
    background: "#fafdff",
    borderTop: "1px solid #eef3f6",
    marginTop: "auto"
  };
  function stopPropagationClick(e) { e.stopPropagation(); }

  return (
    <section className="pb-5">
      <div className="container-lg">
        <div className="row">
          <div className="col-md-12">
            <motion.div
              className="product-grid row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-3 row-cols-xl-4 row-cols-xxl-5"
              style={{marginBottom: 20}}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <AnimatePresence initial={false}>
                {products.map((p, idx) => {
                  return (
                    <motion.div
                      className="col d-flex"
                      key={p.id || idx}
                      custom={idx}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      variants={cardAnim}
                    >
                      <motion.div
                        className="product-item w-100"
                        style={productItemStyle}
                        whileHover={{ y: -4, scale: 1.015, boxShadow: '0 8px 32px #1976d215' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/product/${p.id}`)}
                        title={p.name}
                        tabIndex={0}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate(`/product/${p.id}`); }}
                      >
                        <div style={imageWrapStyle}>
                          <motion.img
                            src={getImageSrc(p)}
                            alt={p.name + ' Thumbnail'}
                            style={imageStyle}
                            whileHover={{ scale: 1.04, boxShadow: "0 8px 18px #92c5ff11" }}
                            onClick={e => { e.stopPropagation(); navigate(`/product/${p.id}`); }}
                          />
                        </div>
                        <div style={contentStyle}>
                          <h3 className="fs-6 fw-semibold mb-1" style={{ color: "#273674", fontWeight: 600, maxHeight: 36, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
                            {p.name}
                          </h3>
                          <div>
                            <span className="rating">{renderStars(p.rating || 0)}</span>
                            <span className="ms-1 fs-7 text-secondary">{p.reviews}</span>
                          </div>
                          <div className="d-flex justify-content-center align-items-center gap-2 my-1">
                            {p.old_price && <del className="fs-7" style={{ color: "#d77"}}>₹{p.old_price}</del>}
                            <span style={{
                              color: "#28a745",
                              fontWeight: 700,
                              fontSize: "1.10em",
                              letterSpacing: ".01em",
                              background: "linear-gradient(93deg,#edfff0 66%,#d5fded 100%)",
                              borderRadius: "9px",
                              padding: "1px 8px"
                            }}>₹{p.price}</span>
                            {p.discount && (
                              <span className="badge bg-warning text-dark fw-normal px-2 fs-7 lh-1 ms-1" style={{
                                borderRadius: 7
                              }}>
                                {p.discount}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Actions (don't bubble click up!) */}
                        <div style={bottomAreaStyle} onClick={stopPropagationClick}>
                          <div className="row g-1">
                            <div className="col-4">
                              <input
                                type="number"
                                name="quantity"
                                className="form-control border-dark-subtle input-number quantity"
                                defaultValue={1}
                                min={1}
                                ref={el => (quantityRefs.current[idx] = el)}
                                aria-label="Quantity"
                                style={{ fontSize: ".97em" }}
                              />
                            </div>
                            <div className="col-5">
                              <motion.button
                                type="button"
                                className="btn btn-primary rounded-2 p-2 fs-7 btn-cart w-100 d-flex align-items-center justify-content-center"
                                onClick={e => { stopPropagationClick(e); handleAddToCart(p.id, idx); }}
                                style={{
                                  cursor: "pointer",
                                  fontWeight: 600
                                }}
                                whileHover={{ scale: 1.07, backgroundColor: "#169a38" }}
                                whileTap={{ scale: 0.97 }}
                              >
                                <svg width="17" height="17" className="me-1">
                                  <use xlinkHref="#cart" />
                                </svg>
                                Add to Cart
                              </motion.button>
                            </div>
                            <div className="col-3">
                              <motion.button
                                type="button"
                                className="btn btn-outline-dark rounded-2 p-2 fs-6 w-100 d-flex align-items-center justify-content-center"
                                aria-label="Add to Wishlist"
                                onClick={e => { stopPropagationClick(e); handleAddToWishlist(p.id, idx); }}
                                style={{
                                  cursor: "pointer"
                                }}
                                whileHover={{ scale: 1.14, color: "#eb3468", borderColor: "#eb3468", backgroundColor: "#ffe7f2" }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <svg width="16" height="16">
                                  <use xlinkHref="#heart" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </div>
                        {/* Toast for feedback, animated */}
                        <AnimatePresence>
                          {feedbackMsg && feedbackIdx === idx && (
                            <motion.div
                              className="position-absolute top-0 start-50 translate-middle-x p-2 px-4 rounded-pill alert alert-info shadow"
                              style={{
                                background: feedbackMsg.includes('Added') || feedbackMsg.includes('Wish')
                                  ? "#ebfff4"
                                  : "#f8f4ff",
                                color: "rgba(44,60,50,1)",
                                fontWeight: 600,
                                marginTop: 12,
                                zIndex: 10,
                                fontSize: ".96em"
                              }}
                              initial={{ opacity: 0, y: -20, scale: 0.92 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9, y: -9 }}
                              transition={{ duration: 0.26 }}
                            >
                              {feedbackMsg}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
            {/* Pagination Controls */}
            <motion.div
              className="pagination mt-4 d-flex justify-content-center align-items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, type: 'spring' }}
            >
              <motion.button
                className="btn btn-outline-primary rounded-2 shadow-sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                whileTap={{ scale: 0.92 }}
                style={{ minWidth: 70, marginRight: 16, fontWeight: 500 }}
              >
                Prev
              </motion.button>
              <span className="mx-2 px-2 rounded-2 border" style={{
                background: '#f8fafc', fontWeight: 600, letterSpacing: ".03em",
                borderColor: '#e5e7eb', color: "#222"
              }}>
                Page {page} of {totalPages}</span>
              <motion.button
                className="btn btn-outline-primary rounded-2 shadow-sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                whileTap={{ scale: 0.92 }}
                style={{ minWidth: 70, marginLeft: 16, fontWeight: 500 }}
              >
                Next
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
      {/* SVG symbols for stars and icons */}
      <svg style={{ display: 'none' }}>
        <symbol id="star-full" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.3l6.2 3.7-1.6-7 5.4-4.6-7-.6L12 2 9 8.8l-7 .6 5.4 4.6-1.6 7z" /></symbol>
        <symbol id="star-half" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17.3l6.2 3.7-1.6-7 5.4-4.6-7-.6L12 2z" /></symbol>
        <symbol id="cart" viewBox="0 0 24 24"><path fill="currentColor" d="M7.6 18C6.7 18 6 18.7 6 19.5S6.7 21 7.6 21s1.6-.7 1.6-1.5-.7-1.5-1.6-1.5zm8.8 0c-.9 0-1.6.7-1.6 1.5s.7 1.5 1.6 1.5 1.6-.7 1.6-1.5-.7-1.5-1.6-1.5zM7 17.2c-1 0-1.6-1-1.4-2l1-7c.2-.9 1-1.6 1.9-1.8l7.1-1c.1 0 .2.1.2.2L16 5l1.8.3-.2 1.2c-.4 2.2-2 5.7-2.3 6.2-.2.4-.5.6-.9.6H9.9c-.5 0-.8-.4-.9-.8L9 10.3c-.1-.5-.3-1.5-.1-2 .2-.6.6-.9 1.2-1.1l.3-.3c.1-.2.3-.2.4-.2l7.1 1c1.2.1 2.3 1.1 2.5 2.3L21 12.3c0 .2-.2.3-.4.3h-15zm12.2-8.6l-1-4.3c-.2-.7-.9-1.2-1.7-1.2H7.6c-.8 0-1.5.5-1.7 1.2l-1 4.3C4.7 8 5.3 8.5 6 8.5h12c.7 0 1.3-.5 1.4-1.1z" /></symbol>
        <symbol id="heart" viewBox="0 0 24 24"><path fill="currentColor" d="M12.1 4.6C10.8 2.7 7.6 2.5 6 5c-.7 1-1 2.2-.6 3.2.5 1.3 2.2 2.6 3.7 4.5l1.6 2.1 1.6-2.1c1.5-1.9 3.2-3.2 3.7-4.5.4-1 .1-2.2-.6-3.2-1.6-2.5-4.8-2.3-6.1 0z" /></symbol>
      </svg>
    </section>
  );
}

export default ProductList;

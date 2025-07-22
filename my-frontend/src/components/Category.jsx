import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import ProductList from './ProductList';

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5;

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [subLoading, setSubLoading] = useState(false);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);

  // Nice color palette for accent circles
  const colorPalette = [
    ["#e0e7ff", "#c7d2fe", "#a5b4fc"],
    ["#ffe4e6", "#fecdd3", "#fda4af"],
    ["#d1fae5", "#6ee7b7", "#34d399"],
    ["#fef9c3", "#fde68a", "#fcd34d"],
    ["#fdf2f8", "#fbcfe8", "#f472b6"],
    ["#ccfbf1", "#99f6e4", "#2dd4bf"],
    ["#eee", "#dcdcdc", "#bdbdbd"],
  ];

  // Animation variants
  const cardVariant = {
    initial: { opacity: 0, scale: 0.92, y: 40 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.80, y: 35 },
    transition: { type: 'spring', stiffness: 280, damping: 20, duration: 0.40 }
  };

  const listVariant = {
    initial: { opacity: 0, y: 35 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 25, transition: { duration: 0.22 } },
    transition: { duration: 0.36, type: 'spring' }
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:3000/api/categories?page=${page}&limit=${limit}`)
      .then(res => {
        let cats = [];
        if (Array.isArray(res.data)) cats = res.data;
        else if (Array.isArray(res.data.categories)) cats = res.data.categories;
        else if (Array.isArray(res.data.data)) cats = res.data.data;
        else if (res.data && typeof res.data === 'object') {
          const arr = Object.values(res.data).find(v => Array.isArray(v));
          if (arr) cats = arr;
        }
        if (!cats.length) setError('No categories found.');
        else {
          setCategories(cats);
          setError(null);
        }
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load categories');
        setLoading(false);
      });
  }, [page]);

  const getImageSrc = (cat) => {
    if (!cat?.imageUrl) return '/images/default-category.jpg';
    if (cat.imageUrl.startsWith('http')) return cat.imageUrl;
    return `http://localhost:3000${cat.imageUrl}`;
  };

  const getColorSet = idx => colorPalette[idx % colorPalette.length];

  const handleCategoryClick = async (cat, idx) => {
    if (!cat || !cat.id) return;
    setSelectedCategory({ ...cat, _colorIdx: idx });
    setSelectedSubcategory(null);
    setSubcategories([]);
    setSubLoading(true);
    try {
      const subRes = await axios.get(`http://localhost:3000/api/subcategories?categoryId=${cat.id}`);
      let subs = [];
      if (Array.isArray(subRes.data)) subs = subRes.data;
      else if (Array.isArray(subRes.data.subcategories)) subs = subRes.data.subcategories;
      else if (Array.isArray(subRes.data.data)) subs = subRes.data.data;
      else if (subRes.data && typeof subRes.data === 'object') {
        const arr = Object.values(subRes.data).find(v => Array.isArray(v));
        if (arr) subs = arr;
      }
      setSubcategories(subs);
    } catch (e) {
      setSubcategories([]);
    }
    setSubLoading(false);
  };

  const handleSubcategoryClick = (subcat) => setSelectedSubcategory(subcat);

  if (loading)
    return (
      <div className="text-center my-5">
        <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }}>Loading...</motion.span>
      </div>
    );
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <section className="py-5 overflow-hidden">
      <div className="container-lg">
        {/* Category Grid */}
        <motion.div {...listVariant} key={page} className="row justify-content-center">
          <div className="col-md-12">
            <div className="d-flex flex-wrap justify-content-center" style={{ gap: '28px' }}>
              <AnimatePresence initial={false}>
                {categories.map((cat, idx) => {
                  const colorSet = getColorSet(idx);
                  const selected = selectedCategory && selectedCategory.id === cat.id;
                  return (
                    <motion.button
                      layout
                      key={cat.id}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      transition={cardVariant.transition}
                      variants={cardVariant}
                      type="button"
                      className="category-card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '21px 15px 14px 15px',
                        borderRadius: '22px',
                        background: selected
                          ? `linear-gradient(142deg, ${colorSet[0]}, ${colorSet[2]})`
                          : '#fff',
                        boxShadow: selected
                          ? `0 8px 40px 0 ${colorSet[2]}66, 0 1.5px 7px 0 #1976d2a8`
                          : '0 2px 14px rgba(33,54,120,0.11)',
                        minWidth: 153,
                        maxWidth: 200,
                        border: selected ? `2.2px solid ${colorSet[2]}` : 'none',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'box-shadow 0.22s, background 0.16s, border 0.2s',
                        color: selected ? '#222' : '#1976d2',
                        filter: selected ? 'brightness(1.07)' : undefined
                      }}
                      whileHover={{
                        scale: 1.085,
                        boxShadow: `0 12px 38px 0 ${colorSet[2]}88, 0 2.5px 8px 0 #1976d2DD`,
                        zIndex: 2,
                      }}
                      whileTap={{
                        scale: 0.96,
                        filter: 'brightness(0.97)'
                      }}
                      onClick={() => handleCategoryClick(cat, idx)}
                    >
                      <motion.div
                        layout
                        style={{
                          width: 108,
                          height: 108,
                          borderRadius: '50%',
                          marginBottom: 14,
                          alignItems: "center",
                          justifyContent: "center",
                          position: "relative",
                          background: `linear-gradient(120deg, ${colorSet[1]}44, #fff)`,
                          boxShadow: `0 1px 9px 0 ${colorSet[1]}33`
                        }}
                      >
                        <motion.img
                          src={getImageSrc(cat)}
                          className="rounded-circle"
                          alt={cat.name + ' Thumbnail'}
                          style={{
                            width: 105,
                            height: 105,
                            objectFit: 'cover',
                            borderRadius: '50%',
                            border: selected ? `4px solid ${colorSet[2]}` : '2.5px solid #eaeaea',
                            background: '#fafafa',
                            display: "block",
                            transition: 'border .17s'
                          }}
                          whileHover={{ scale: 1.07 }}
                          onError={e => { e.target.onerror = null; e.target.src = '/images/default-category.jpg'; }}
                        />
                        {/* Fun: Number of subcats (if already loaded once) */}
                        {selected && subcategories.length > 0 && (
                          <motion.span
                            initial={{ scale: 0.6, opacity: 0, y: 12 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.7, opacity: 0, y: 10 }}
                            transition={{ duration: 0.21, type: 'spring' }}
                            className="badge rounded-pill bg-primary"
                            style={{
                              position: 'absolute',
                              top: -4,
                              right: -8,
                              fontSize: '0.94em'
                            }}
                          >
                            {subcategories.length}
                          </motion.span>
                        )}
                      </motion.div>
                      <h4 className="fs-6 fw-semibold category-title" style={{
                        marginTop: 6,
                        marginBottom: 1,
                        fontWeight: 600,
                        textShadow: selected ? `0px 4px 10px ${colorSet[1]}50` : 'none',
                        color: selected ? "#222" : "#222",
                        letterSpacing: '.03em'
                      }}>
                        {cat.name}
                      </h4>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
            {/* Pagination Controls */}
            <motion.div
              className="pagination mt-4 d-flex justify-content-center align-items-center"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.33, type: 'spring' }}
            >
              <button
                className="btn btn-outline-primary btn-sm rounded-4 shadow-sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                style={{ minWidth: 70, marginRight: 16, fontWeight: 500 }}
              >
                Prev
              </button>
              <span className="mx-1 px-2 rounded-2 border" style={{
                background: '#f8fafc', borderColor: '#e5e7eb',
                color: '#222', fontWeight: 600
              }}>Page {page} of {totalPages}</span>
              <button
                className="btn btn-outline-primary btn-sm rounded-4 shadow-sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                style={{ minWidth: 70, marginLeft: 16, fontWeight: 500 }}
              >
                Next
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Subcategory Buttons */}
        <AnimatePresence>
          {selectedCategory && (
            <motion.div
              className="row mt-4"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.32, type: 'spring' }}
              key={selectedCategory.id}
            >
              <div className="col-12 d-flex flex-wrap justify-content-center" style={{ gap: '12px' }}>
                {subLoading ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ fontSize: "1.08em", color: "#446" }}
                  >Loading subcategories...</motion.div>
                ) : subcategories.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-secondary"
                    style={{ fontSize: '1.04em' }}
                  >
                    No subcategories found for "<b>{selectedCategory.name}</b>".
                  </motion.div>
                ) : (
                  subcategories.map(subcat => (
                    <motion.button
                      layout
                      key={subcat?.id}
                      className={`btn ${selectedSubcategory && selectedSubcategory.id === subcat.id
                        ? 'btn-primary'
                        : 'btn-outline-primary'
                        } rounded-3 px-3 shadow-none`}
                      onClick={() => handleSubcategoryClick(subcat)}
                      disabled={!subcat || !subcat.id}
                      initial={{ opacity: 0, y: 22, scale: 0.93 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.20, type: 'spring' }}
                      whileHover={{ scale: 1.11, borderColor: "#1976d2" }}
                      whileTap={{ scale: 0.95 }}
                      style={selectedSubcategory && selectedSubcategory.id === subcat.id
                        ? { borderWidth: '2.4px', fontWeight: 600 }
                        : { fontWeight: 500 }
                      }
                    >
                      {subcat?.name || "Unnamed"}
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid (reusing ProductList) */}
        <AnimatePresence>
          {selectedSubcategory && (
            <motion.div
              className="row mt-4"
              key={selectedSubcategory.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 44 }}
              transition={{ duration: 0.33, type: 'spring' }}
            >
              <div className="col-12">
                <h5 className="mb-3 text-primary">
                  <span style={{ fontWeight: 700 }}>{selectedSubcategory.name}</span> Products
                </h5>
                <ProductList subcategoryId={selectedSubcategory.id} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default Category;

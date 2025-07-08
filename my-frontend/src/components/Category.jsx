import React, { useEffect, useState } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios
      .get(`http://localhost:3000/api/categories?page=${page}&limit=${limit}`)
      .then(res => {
        // Log the response for debugging!
        console.log('Categories API response:', res.data);

        let cats = [];
        // Try all common shapes
        if (Array.isArray(res.data)) {
          cats = res.data;
        } else if (Array.isArray(res.data.categories)) {
          cats = res.data.categories;
        } else if (Array.isArray(res.data.data)) {
          cats = res.data.data;
        } else if (res.data && typeof res.data === 'object') {
          // Try to find the first array property in the object
          const arr = Object.values(res.data).find(v => Array.isArray(v));
          if (arr) cats = arr;
        }

        if (!cats.length) {
          setError('No categories found.');
        } else {
          setCategories(cats);
          setError(null);
        }
        setTotalPages(res.data.totalPages || 1);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load categories');
        setLoading(false);
      });
  }, [page]);

  const getImageSrc = (cat) => {
    if (!cat?.imageUrl) return '/images/default-category.jpg';
    if (cat.imageUrl.startsWith('http')) return cat.imageUrl;
    return `http://localhost:3000${cat.imageUrl}`;
  };

  const handleCategoryClick = async (cat) => {
    if (!cat || !cat.id) return;
    setSelectedCategory(cat);
    setSelectedSubcategory(null);
    setSubcategories([]);
    setSubLoading(true);

    try {
      const subRes = await axios.get(`http://localhost:3000/api/subcategories?categoryId=${cat.id}`);
      console.log('Subcategories API response:', subRes.data);
      let subs = [];
      if (Array.isArray(subRes.data)) {
        subs = subRes.data;
      } else if (Array.isArray(subRes.data.subcategories)) {
        subs = subRes.data.subcategories;
      } else if (Array.isArray(subRes.data.data)) {
        subs = subRes.data.data;
      } else if (subRes.data && typeof subRes.data === 'object') {
        const arr = Object.values(subRes.data).find(v => Array.isArray(v));
        if (arr) subs = arr;
      }
      setSubcategories(subs);
    } catch (e) {
      setSubcategories([]);
    }
    setSubLoading(false);
  };

  const handleSubcategoryClick = (subcat) => {
    setSelectedSubcategory(subcat);
  };

  if (loading) return <div className="text-center my-5">Loading...</div>;
  if (error) return <div className="text-danger">{error}</div>;

  return (
    <section className="py-5 overflow-hidden">
      <div className="container-lg">
        {/* Category Grid */}
        <div className="row justify-content-center">
          <div className="col-md-12">
            <div className="d-flex flex-wrap justify-content-center" style={{ gap: '24px' }}>
              {categories.map(cat => (
                <button
                  type="button"
                  className="text-center category-card"
                  key={cat.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '18px',
                    margin: '8px',
                    borderRadius: '16px',
                    background: selectedCategory && selectedCategory.id === cat.id ? '#e3f2fd' : '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    minWidth: 140,
                    maxWidth: 180,
                    transition: 'box-shadow 0.2s, background 0.2s',
                    textDecoration: 'none',
                    color: 'inherit',
                    border: selectedCategory && selectedCategory.id === cat.id ? '2px solid #1976d2' : 'none',
                    cursor: 'pointer'
                  }}
                  onClick={() => handleCategoryClick(cat)}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(25,118,210,0.12)'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'}
                >
                  <img
                    src={getImageSrc(cat)}
                    className="rounded-circle"
                    alt={cat.name + ' Thumbnail'}
                    style={{
                      width: 100,
                      height: 100,
                      objectFit: 'cover',
                      marginBottom: 12,
                      border: '3px solid #eee',
                      background: '#fafafa'
                    }}
                    onError={e => { e.target.onerror = null; e.target.src = '/images/default-category.jpg'; }}
                  />
                  <h4 className="fs-6 fw-semibold category-title" style={{ marginTop: 8 }}>{cat.name}</h4>
                </button>
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

        {/* Subcategory Buttons */}
        {selectedCategory && (
          <div className="row mt-4">
            <div className="col-12 d-flex flex-wrap justify-content-center" style={{ gap: '12px' }}>
              {subLoading ? (
                <div>Loading subcategories...</div>
              ) : subcategories.length === 0 ? (
                <div className="text-secondary">No subcategories found for "{selectedCategory.name}".</div>
              ) : (
                subcategories.map(subcat => (
                  <button
                    key={subcat?.id}
                    className={`btn ${selectedSubcategory && selectedSubcategory.id === subcat.id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => handleSubcategoryClick(subcat)}
                    disabled={!subcat || !subcat.id}
                  >
                    {subcat?.name || "Unnamed"}
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Products Grid (reusing ProductList) */}
        {selectedSubcategory && (
          <div className="row mt-4">
            <div className="col-12">
              <h5 className="mb-3 text-primary">
                {selectedSubcategory.name} Products
              </h5>
              <ProductList subcategoryId={selectedSubcategory.id} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default Category;

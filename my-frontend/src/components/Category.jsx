import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 5; // 5 categories per page

  useEffect(() => {
    setLoading(true);
    axios
      .get(`http://localhost:3000/api/categories?page=${page}&limit=${limit}`)
      .then(res => {
        // Adjust this if your backend response is different
        setCategories(res.data.categories);
        setTotalPages(res.data.totalPages);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load categories');
        setLoading(false);
      });
  }, [page]);

  // Helper function to get the correct image URL
  const getImageSrc = (cat) => {
    if (!cat.imageUrl) {
      // No image set, use default
      return '/images/default-category.jpg';
    }
    if (cat.imageUrl.startsWith('http')) {
      // Remote image URL
      return cat.imageUrl;
    }
    // Local image path from backend
    return `http://localhost:3000${cat.imageUrl}`;
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <section className="py-5 overflow-hidden">
      <div className="container-lg">
        <div className="row">
          <div className="col-md-12">
            <div className="section-header d-flex flex-wrap justify-content-between mb-5">
              <h2 className="section-title">Category</h2>
              <div className="d-flex align-items-center">
                <a href="/categories" className="btn btn-primary me-2">View All</a>
                <div className="swiper-buttons">
                  <button type="button" className="swiper-prev category-carousel-prev btn btn-yellow" aria-label="Previous Categories">❮</button>
                  <button type="button" className="swiper-next category-carousel-next btn btn-yellow" aria-label="Next Categories">❯</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12">
            <div className="category-carousel swiper">
              <div className="swiper-wrapper d-flex">
                {categories.map(cat => (
                  <a
                    href={`/category/${cat.id}`}
                    className="nav-link swiper-slide text-center"
                    key={cat.id}
                  >
                    <img
                      src={getImageSrc(cat)}
                      className="rounded-circle"
                      alt={cat.name + ' Thumbnail'}
                      style={{ width: 80, height: 80, objectFit: 'cover' }}
                    />
                    <h4 className="fs-6 mt-3 fw-normal category-title">{cat.name}</h4>
                  </a>
                ))}
              </div>
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

export default Category;

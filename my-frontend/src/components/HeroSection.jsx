// src/components/HeroSection.jsx
import bannerImg from '../assets/images/banner-1.jpg'; // Adjust the path if needed

const heroSectionStyle = {
  backgroundImage: `url(${bannerImg})`,
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

function HeroSection() {
  return (
    <section style={heroSectionStyle}>
      <div className="container-lg">
        <div className="row">
          <div className="col-lg-6 pt-5 mt-5">
            <h2 className="display-1 ls-1">
              <span className="fw-bold text-primary">Errica</span> Delivery at your{' '}
              <span className="fw-bold">Doorsteps</span>
            </h2>
            <p className="fs-4">Dignissim massa diam elementum.</p>
            <div className="d-flex gap-3">
<button type="button" className="btn btn-primary text-uppercase fs-6 rounded-pill px-4 py-3 mt-3">
  Start Shopping
</button>
<button type="button" className="btn btn-dark text-uppercase fs-6 rounded-pill px-4 py-3 mt-3">
  Join Now
</button>

            </div>
            <div className="row my-5">
              <div className="col">
                <div className="row text-dark">
  <div   style={{
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '12px',
    padding: '16px 32px',
    display: 'inline-block'
  }} className="col-auto" >
  <p
    className="fs-1 fw-bold lh-sm mb-0"
    style={{
      color: '#28a745',
      textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
    }}
  >
    14k+
  </p>
  </div>
                  <div   style={{
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '12px',
    padding: '16px 32px',
    display: 'inline-block'
  }} className="col" >
                    <p className="text-uppercase lh-sm mb-0 text-white"style={{
      color: '#28a745',
      textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
    }}>Product Varieties</p>
                  </div>
                </div>
              </div>
              <div className="col" >
                <div className="row text-dark">
                  <div className="col-auto" style={{
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '12px',
    padding: '16px 32px',
    display: 'inline-block'
  }}>
                    <p className="fs-1 fw-bold lh-sm mb-0 text-white" style={{
      color: '#28a745',
      textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
    }}>50k+</p>
                  </div>
                  <div className="col"
                  style={{
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '12px',
    padding: '16px 32px',
    display: 'inline-block'
  }}>
                    <p className="text-uppercase lh-sm mb-0 text-white" style={{
      color: '#28a745',
      textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
    }}>Happy Customers</p>
                  </div>
                </div>
              </div>
              <div className="col">
                <div className="row text-dark">
                  <div className="col-auto" style={{
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '12px',
    padding: '16px 32px',
    display: 'inline-block'
  }}>
                    <p className="fs-1 fw-bold lh-sm mb-0 text-white" style={{
      color: '#28a745',
      textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
    }}>10+</p>
                  </div>
                  <div className="col" style={{
    background: 'rgba(0,0,0,0.5)',
    borderRadius: '12px',
    padding: '16px 32px',
    display: 'inline-block'
  }}>
                    <p className="text-uppercase lh-sm mb-0 text-white" style={{
      color: '#28a745',
      textShadow: '2px 2px 8px rgba(0,0,0,0.7)'
    }}>Store Locations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-sm-3 row-cols-lg-3 g-0 justify-content-center">
          <div className="col">
            <div className="card border-0 bg-primary rounded-0 p-4 text-light">
              <div className="row">
                <div className="col-md-3 text-center">
                  <svg width="60" height="60">
                    <use xlinkHref="#fresh"></use>
                  </svg>
                </div>
                <div className="col-md-9">
                  <div className="card-body p-0">
                    <h5 className="text-light">Latest,Trendy Items</h5>
                    <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipi elit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card border-0 bg-secondary rounded-0 p-4 text-light">
              <div className="row">
                <div className="col-md-3 text-center">
                  <svg width="60" height="60">
                    <use xlinkHref="#Errica"></use>
                  </svg>
                </div>
                <div className="col-md-9">
                  <div className="card-body p-0">
                    <h5 className="text-light">100% trusted</h5>
                    <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipi elit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="card border-0 bg-danger rounded-0 p-4 text-light">
              <div className="row">
                <div className="col-md-3 text-center">
                  <svg width="60" height="60">
                    <use xlinkHref="#delivery"></use>
                  </svg>
                </div>
                <div className="col-md-9">
                  <div className="card-body p-0">
                    <h5 className="text-light">Free delivery</h5>
                    <p className="card-text">Lorem ipsum dolor sit amet, consectetur adipi elit.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default HeroSection;

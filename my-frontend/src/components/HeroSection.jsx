import React from 'react';
import { motion } from 'framer-motion';
import bannerImg from '../assets/images/banner-1.jpg'; // Adjust if needed

const heroSectionStyle = {
  backgroundImage: `linear-gradient(110deg, rgba(13,17,23,0.53) 40%, rgba(50,99,158,0.15)), url(${bannerImg})`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  backgroundSize: 'cover',
  minHeight: 560,
  position: 'relative',
};

const fadeUp = {
  initial: { opacity: 0, y: 35 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.85, type: 'spring' }
};

const statAnim = {
  initial: { opacity: 0, y: 40, scale: 0.94 },
  animate: i => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { delay: 0.32 + i * 0.15, duration: 0.55, type: 'spring' }
  })
};

const featureAnim = {
  initial: { opacity: 0, y: 30 },
  animate: i => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.6 + i * 0.18, duration: 0.5, type: 'spring' }
  })
};

function HeroSection() {
  const stats = [
    { amount: '14k+', label: 'Product Varieties' },
    { amount: '50k+', label: 'Happy Customers' },
    { amount: '10+', label: 'Store Locations' }
  ];

  const features = [
    {
      svg: "#fresh",
      color: "primary",
      title: "Latest, Trendy Items",
      desc: "Shop the trendiest and freshest products released every week.",
    },
    {
      svg: "#Errica",
      color: "secondary",
      title: "100% Trusted",
      desc: "Errica is known for reliability, security and quality.",
    },
    {
      svg: "#delivery",
      color: "danger",
      title: "Free Delivery",
      desc: "Enjoy superfast zero-fee doorstep delivery—always.",
    },
  ];

  return (
    <section style={heroSectionStyle} className="position-relative">
      <div className="position-absolute w-100 h-100" style={{ top: 0, left: 0, background: "linear-gradient(96deg,rgba(12,14,19,0.36) 58%,rgba(42,61,116,0.10)" }}></div>
      <div className="container-lg position-relative" style={{ zIndex: 2 }}>
        <div className="row align-items-center">
          <div className="col-lg-6 pt-5 mt-5">
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.1, duration: 0.75, type: 'spring' }}
            >
              <h2 className="display-1 ls-1 mb-3" style={{ fontWeight: 800, textShadow: '0 4px 24px #03145419', color: "#fff" }}>
                <span className="fw-bold text-primary">Errica</span> Delivery at your{' '}
                <span className="fw-bold">Doorsteps</span>
              </h2>
              <p className="fs-4 text-light mb-4">Dignissim massa diam elementum.</p>
            </motion.div>
            <motion.div
              className="d-flex gap-3 mb-3"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.64, type: 'spring' }}
            >
              <motion.button
                className="btn btn-primary text-uppercase fs-6 rounded-pill px-4 py-3 mt-3"
                whileHover={{ scale: 1.07, boxShadow: '0 4px 16px #4955f664' }}
                whileTap={{ scale: 0.95 }}
                style={{ letterSpacing: ".07em", fontWeight: 700 }}
              >
                Start Shopping
              </motion.button>
              <motion.button
                className="btn btn-dark text-uppercase fs-6 rounded-pill px-4 py-3 mt-3"
                whileHover={{ scale: 1.07, boxShadow: '0 4px 16px #172b3961' }}
                whileTap={{ scale: 0.95 }}
                style={{ letterSpacing: ".07em", fontWeight: 700 }}
              >
                Join Now
              </motion.button>
            </motion.div>
            <div className="row my-5">
              {stats.map((stat, i) => (
                <motion.div
                  className="col"
                  key={stat.label}
                  custom={i}
                  initial="initial"
                  animate="animate"
                  variants={statAnim}
                >
                  <div className="d-flex flex-column align-items-center">
                    <div
                      className="mb-2"
                      style={{
                        background: 'rgba(24,255,132,0.13)',
                        borderRadius: '18px 1.6rem 1.2rem 1.2rem',
                        padding: '18px 36px 11px 36px',
                        minWidth: 110,
                        boxShadow: "0 2px 24px #12d27822"
                      }}>
                      <span
                        className="fs-1 fw-bolder lh-sm mb-0 text-success"
                        style={{
                          textShadow: '1.2px 3.2px 13px #28a74542,0 1px 0 #e9faea'
                        }}
                      >
                        {stat.amount}
                      </span>
                    </div>
                    <div>
                      <span className="fs-6 fw-bold text-light text-uppercase" style={{
                        textShadow: '0 1px 5px rgba(0,0,0,0.34)',
                        letterSpacing: ".04em"
                      }}>{stat.label}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-sm-3 row-cols-lg-3 g-4 justify-content-center mb-1 mt-3">
          {features.map((feat, i) => (
            <motion.div
              className="col"
              key={feat.title}
              custom={i}
              initial="initial"
              animate="animate"
              variants={featureAnim}
            >
              <motion.div
                className={`card border-0 rounded-4 bg-${feat.color} p-4 text-light shadow-lg h-100 position-relative`}
                whileHover={{
                  y: -6,
                  scale: 1.05,
                  boxShadow: `0 16px 52px 0 #22282873`
                }}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: `var(--bs-${feat.color})`
                }}
              >
                <div className="row align-items-center">
                  <motion.div
                    className="col-md-3 text-center"
                    whileHover={{ rotate: 7, scale: 1.15 }}
                    transition={{ type: "spring", stiffness: 380, damping: 16 }}
                  >
                    <svg width="52" height="52">
                      <use xlinkHref={feat.svg}></use>
                    </svg>
                  </motion.div>
                  <div className="col-md-9">
                    <div className="card-body p-0">
                      <h5 className="text-light fw-bold mb-1" style={{ fontSize: 19, letterSpacing: ".01em" }}>
                        {feat.title}
                      </h5>
                      <p className="card-text mb-0 opacity-90">{feat.desc}</p>
                    </div>
                  </div>
                </div>
                <motion.div
                  className="position-absolute"
                  style={{
                    top: -10, right: -15, width: 43, height: 43, zIndex: 1,
                    background: "radial-gradient(circle at top left, #fff4 30%, transparent 70%)",
                    borderRadius: "30% 70% 61% 39% / 49% 44% 56% 51%"
                  }}
                  initial={{ opacity: .2, scale: 1.1 }}
                  animate={{ opacity: .32, scale: 1.33 }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HeroSection;

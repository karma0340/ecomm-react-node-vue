import React from 'react';

export default function AboutPage() {
  return (
    <div className="container" style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h2>About Us</h2>
      <p>
        Welcome to Our App! We are dedicated to providing a seamless experience for our users.
      </p>
      <p>
        Our mission is to deliver high-quality solutions and outstanding support.
      </p>
      <p>
        If you have any questions or feedback, please visit our <a href="/contact">Contact</a> page.
      </p>
    </div>
  );
}

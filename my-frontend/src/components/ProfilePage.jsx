import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Container, Row, Col, Button, Card, ListGroup, Badge, Form, Spinner, Tab, Alert, Collapse
} from "react-bootstrap";
import {
  PersonFill, BoxSeam, HeartFill, ShieldLock, GeoAltFill, EnvelopeFill, CameraFill,
  ChevronDown, ChevronUp, EyeFill, TrashFill, PhoneFill as PhoneIcon
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef();
  const [tab, setTab] = useState("profile");
  const [alert, setAlert] = useState(null);
  const [wishlistAlert, setWishlistAlert] = useState(null);
  const [pwd, setPwd] = useState({ old: "", new1: "", new2: "" });
  const [pwdEditing, setPwdEditing] = useState(false);
  const [openOrder, setOpenOrder] = useState(null);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressForm, setAddressForm] = useState({ name: "", phone: "", pincode: "", address: "", city: "", state: "", landmark: "" });
  const [addressAlert, setAddressAlert] = useState(null);

  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [contactAlert, setContactAlert] = useState(null);
  const [contactLoading, setContactLoading] = useState(false);

  const fade = {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 16 },
    transition: { duration: 0.45, type: "spring" }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setAlert({ type: "danger", msg: "No token. Please log in." });
      setLoading(false);
      return;
    }
    setLoading(true);
    Promise.all([
      axios.get("/api/users/me", { headers: { Authorization: `Bearer ${token}` } }),
      axios.get("/api/users/me/orders", { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(([u, o]) => {
        setUser(u.data);
        setOrders(Array.isArray(o.data) ? o.data : (o.data.orders || []));
        setForm(u.data);
        setAvatarPreview(u.data.avatarUrl || "");
        setLoading(false);
      })
      .catch((err) => {
        let msg = "Failed to load profile.";
        if (err.response?.data?.message) msg = err.response.data.message;
        else if (err.response?.status === 401 || err.response?.status === 403)
          msg = "Unauthorized. Please log in again.";
        setAlert({ type: "danger", msg });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (tab !== "wishlist") return;
    setWishlistLoading(true);
    setWishlistAlert(null);
    const token = localStorage.getItem("token");
    axios.get("/api/wishlist/items", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setWishlist(Array.isArray(res.data) ? res.data : (res.data.wishlist || [])))
      .catch(err => {
        let msg = err.response?.data?.message || "Could not load wishlist.";
        setWishlistAlert({ type: "danger", msg });
        setWishlist([]);
      })
      .finally(() => setWishlistLoading(false));
  }, [tab]);

  useEffect(() => {
    if (tab !== "address") return;
    setAddressLoading(true);
    setAddressAlert(null);
    const token = localStorage.getItem("token");
    axios.get("/api/users/me/addresses", { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setAddresses(Array.isArray(res.data) ? res.data : (res.data.addresses || [])))
      .catch(err => {
        let msg = err.response?.data?.message || "Could not load addresses.";
        setAddressAlert({ type: "danger", msg });
        setAddresses([]);
      })
      .finally(() => setAddressLoading(false));
  }, [tab]);

  const handleEdit = () => setEdit(true);
  const handleCancelEdit = () => {
    setEdit(false);
    setForm(user);
    setAvatarPreview(user?.avatarUrl ?? "");
    setAlert(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(f => ({ ...f, avatar: file }));
    const reader = new FileReader();
    reader.onload = e2 => setAvatarPreview(e2.target.result);
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async e => {
    e.preventDefault();
    const { name, username, email, avatar } = form;
    if (!name?.trim() || !username?.trim() || !email?.trim()) {
      setAlert({ type: "warning", msg: "Name, username, and email are required." });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const fd = new FormData();

if (form.name && form.name.trim()) fd.append("name", form.name.trim());
if (form.username && form.username.trim()) fd.append("username", form.username.trim());
if (form.email && form.email.trim()) fd.append("email", form.email.trim());
if (form.phone && form.phone.trim()) fd.append("phone", form.phone.trim());
if (avatar && typeof avatar !== "string") fd.append("avatar", avatar);

      const res = await axios.put("/api/users/me", fd, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setForm(res.data);
      setAvatarPreview(res.data.avatarUrl ||res.data.avatar|| "");
      setEdit(false);
      setAlert({ type: "success", msg: "Profile updated successfully!" });
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      let msg = "Failed to update profile.";
      if (err.response) {
        msg = err.response.data?.message || err.response.data?.error ||
          (typeof err.response.data === "string" ? err.response.data : "Failed to update profile.");
      } else if (err.request) {
        msg = "No response from server.";
      } else if (err.message) {
        msg = err.message;
      }
      setAlert({ type: "danger", msg });
    }
  };

  const handlePwdChange = e => setPwd(p => ({ ...p, [e.target.name]: e.target.value }));
  const handlePwdSave = async e => {
    e.preventDefault();
    if (!pwd.old || !pwd.new1 || !pwd.new2) {
      setAlert({ type: "warning", msg: "All password fields are required." });
      return;
    }
    if (pwd.new1 !== pwd.new2) {
      setAlert({ type: "danger", msg: "Passwords do not match." });
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put("/api/users/me/change-password", {
        oldPassword: pwd.old, newPassword: pwd.new1
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAlert({ type: "success", msg: "Password changed!" });
      setPwd({ old: "", new1: "", new2: "" });
      setPwdEditing(false);
    } catch (err) {
      let msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (typeof err.response?.data === "string" ? err.response.data : "Password change failed.");
      setAlert({ type: "danger", msg });
    }
  };
  const handleSignOut = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const handleContactInput = e => {
    const { name, value } = e.target;
    setContactForm(f => ({ ...f, [name]: value }));
    setContactAlert(null);
  };
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactAlert(null);
    try {
      await axios.post("/api/contact", contactForm);
      setContactAlert({ type: "success", msg: "Thank you! We have received your message and will get back to you soon." });
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setContactAlert({ type: "danger", msg: "Failed to send your message. Please try again later." });
    }
    setContactLoading(false);
  };

  function OrderCard({ order, expanded, onToggle }) {
    const statusColors = {
      Delivered: "success",
      Processing: "info",
      Cancelled: "danger",
      Shipped: "warning",
      Pending: "secondary"
    };
    const statusColor = statusColors[order.status] || "primary";
    return (
      <Card className="mb-3 shadow-sm">
        <Card.Header style={{ background: "#f9fafd" }}
          className="fw-bold d-flex align-items-center justify-content-between"
        >
          <span>
            <Badge bg={statusColor}>{order.status}</Badge>
            <span className="ms-3 text-dark">Order #{order._id?.slice(-7).toUpperCase() || "ID"}</span>
          </span>
          <span>
            <span className="small text-secondary">{new Date(order.createdAt).toLocaleString()}</span>
            <Button
              variant="link"
              className="ms-2 p-0"
              onClick={onToggle}
              aria-expanded={expanded}
              aria-label={expanded ? 'Hide details' : 'Show details'}
            >
              {expanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
          </span>
        </Card.Header>
        <Collapse in={expanded}>
          <Card.Body>
            <Row>
              <Col md={8}>
                <div className="fw-bold mb-1">Shipping Address</div>
                <div className="mb-2 text-muted small">
                  {order.shippingAddress?.fullAddress ||
                    `${order.shippingAddress?.address || ""} ${order.shippingAddress?.city || ""} ${order.shippingAddress?.state || ""}`.trim() ||
                    "N/A"}
                </div>
              </Col>
              <Col md={4} className="text-end">
                <div><b>Payment:</b> {order.paymentMethod || "N/A"}</div>
                <div><b>Total:</b> ₹{order.total?.toLocaleString() ?? order.total}</div>
              </Col>
            </Row>
            <hr />
            <div>
              <b>Items:</b>
              <ul className="ms-3 mt-2 small">
                {(order.items || []).map((item, idx) => (
                  <li key={item._id || idx}>
                    <span>
                      <b>{item.productName}</b> × {item.quantity}
                      {!!item.price && <> &mdash; <span className="text-muted">₹{item.price}</span></>}
                      {item.variation && (
                        <span className="ms-2 badge bg-light text-dark border small">{item.variation}</span>
                      )}
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          height={24}
                          style={{ marginLeft: 10, borderRadius: 3, border: "1px solid #eee" }}
                        />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-2 d-flex gap-2">
              <Button
                size="sm"
                variant="outline-secondary"
                disabled
              >Track (coming soon)</Button>
              {order.invoiceUrl &&
                <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-link">
                  Download Invoice
                </a>}
            </div>
          </Card.Body>
        </Collapse>
      </Card>
    );
  }

  function WishlistProductCard({ product, onRemove }) {
    return (
      <Card className="mb-3 shadow-sm" style={{ minHeight: 100 }}>
        <Row className="g-0 align-items-center">
          <Col xs={3} md={2} className="p-2 text-center">
            <img
              src={product.imageUrl || "/default-product.png"}
              alt={product.title}
              className="img-fluid rounded"
              style={{ maxHeight: 70, objectFit: "contain" }}
            />
          </Col>
          <Col xs={9} md={7}>
            <Card.Body>
              <div className="fw-bold">{product.title || product.name}</div>
              <div className="small text-muted">{product.brand || ""}</div>
              {product.price && (
                <div className="text-success fw-bold mt-1">₹{product.price.toLocaleString()}</div>
              )}
            </Card.Body>
          </Col>
          <Col xs={12} md={3} className="p-2 text-md-end text-center">
            <Button
              variant="outline-primary"
              size="sm"
              className="me-1"
              href={`/product/${product._id || product.id || product.slug  || ""}`}
              target="_blank"
            >
              <EyeFill className="mb-1" /> View
            </Button>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={onRemove}
            >
              <TrashFill className="mb-1" /> Remove
            </Button>
          </Col>
        </Row>
      </Card>
    );
  }

  const handleRemoveWishlist = async (productId) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`/api/wishlist/items/${productId}`, { headers: { Authorization: `Bearer ${token}` } });
      setWishlist(wishlist => wishlist.filter(p => (p._id || p.id) !== productId));
      setWishlistAlert({ type: "success", msg: "Removed from wishlist." });
    } catch {
      setWishlistAlert({ type: "danger", msg: "Could not remove from wishlist." });
    }
  };

  const resetAddressForm = () => setAddressForm({ name: "", phone: "", pincode: "", address: "", city: "", state: "", landmark: "" });
  const handleAddressFormChange = e => setAddressForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleAddressSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (editingAddress && editingAddress.id) {
        const res = await axios.put(`/api/users/me/addresses/${editingAddress.id}`, addressForm, { headers: { Authorization: `Bearer ${token}` } });
        setAddresses(addresses => addresses.map(a => (a.id === res.data.id ? res.data : a)));
        setAddressAlert({ type: "success", msg: "Address updated." });
      } else {
        const res = await axios.post("/api/users/me/addresses", addressForm, { headers: { Authorization: `Bearer ${token}` } });
        setAddresses(addresses => [...addresses, res.data]);
        setAddressAlert({ type: "success", msg: "Address added." });
      }
      setEditingAddress(null);
      resetAddressForm();
    } catch (err) {
      setAddressAlert({ type: "danger", msg: "Could not save address." });
    }
  };
  const handleEditAddress = (a) => {
    setEditingAddress(a);
    setAddressForm({
      name: a.name || "",
      phone: a.phone || "",
      pincode: a.pincode || "",
      address: a.address || "",
      city: a.city || "",
      state: a.state || "",
      landmark: a.landmark || ""
    });
  };
  const handleDeleteAddress = async (id) => {
    const token = localStorage.getItem("token");
    if (!window.confirm("Delete this address?")) return;
    try {
      await axios.delete(`/api/users/me/addresses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAddresses(addresses => addresses.filter(a => a.id !== id));
      setAddressAlert({ type: "success", msg: "Address deleted." });
    } catch {
      setAddressAlert({ type: "danger", msg: "Could not delete address." });
    }
  };
  const handleSetDefault = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.put(`/api/users/me/addresses/${id}/default`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAddresses(addresses => addresses.map(a => ({ ...a, isDefault: a.id === id })));
      setAddressAlert({ type: "success", msg: "Set as primary address." });
    } catch {
      setAddressAlert({ type: "danger", msg: "Could not set default." });
    }
  };

  if (loading)
    return (
      <div style={{ minHeight: "80vh" }} className="d-flex align-items-center justify-content-center">
        <Spinner animation="border" /> <span className="ms-3">Loading profile...</span>
      </div>
    );
  if (!user && !loading)
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{alert ? alert.msg : "Profile not found or not logged in."}</Alert>
      </Container>
    );

  return (
    <Container fluid style={{ background: "#f4f6fb", minHeight: "100vh" }}>
      <Row className="justify-content-center pt-4 pb-5 px-2">
        <Col xs={12} md={3} className="mb-3">
          <Card className="shadow-sm">
            <Card.Body className="text-center">
              <div style={{ position: "relative", width: 110, margin: "0 auto" }}>
                <motion.img
                  src={avatarPreview || user?.avatarUrl ||"/default-avatar.png"}
                  alt="avatar"
                  width={110}
                  height={110}
                  className="rounded-circle border"
                  style={{ objectFit: "cover" }}
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.7, type: "spring" }}
                />
                {edit &&
                  <Form.Group controlId="avatarUpload" style={{
                    position: "absolute", right: 8, bottom: 0, cursor: "pointer", background: "rgba(255,255,255,.9)", borderRadius: "50%"
                  }}>
                    <Form.Control
                      type="file" accept="image/*" hidden
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                    />
                    <span onClick={() => fileInputRef.current.click()}>
                      <CameraFill color="#4955f6" size={27} style={{ padding: 3 }} />
                    </span>
                  </Form.Group>
                }
              </div>
              <h5 className="mt-3">{user.name}</h5>
              <p className="mb-0 text-muted">@{user.username}</p>
              <p className="small text-secondary">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
              <div className="mb-3">
                <Badge pill bg="primary" style={{ fontSize: ".95rem" }}>
                  {user.email}
                </Badge>
              </div>
              <Button size="sm" variant="outline-danger" className="mt-2" onClick={handleSignOut}>
                Sign Out
              </Button>
            </Card.Body>
          </Card>
          <Card className="shadow-sm mt-4">
            <ListGroup variant="flush">
              <ListGroup.Item
                action active={tab === "profile"}
                onClick={() => setTab("profile")}
              ><PersonFill className="me-2" /> Profile</ListGroup.Item>
              <ListGroup.Item
                action active={tab === "orders"}
                onClick={() => setTab("orders")}
              ><BoxSeam className="me-2" /> Orders</ListGroup.Item>
              <ListGroup.Item
                action active={tab === "password"}
                onClick={() => setTab("password")}
              ><ShieldLock className="me-2" /> Security</ListGroup.Item>
              <ListGroup.Item
                action active={tab === "wishlist"}
                onClick={() => setTab("wishlist")}
              ><HeartFill className="me-2" /> Wishlist</ListGroup.Item>
              <ListGroup.Item
                action active={tab === "address"}
                onClick={() => setTab("address")}
              ><GeoAltFill className="me-2" /> Addresses</ListGroup.Item>
              <ListGroup.Item
                action active={tab === "contact"}
                onClick={() => setTab("contact")}
              ><EnvelopeFill className="me-2" /> Contact</ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          {alert && <motion.div {...fade}><Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>{alert.msg}</Alert></motion.div>}
          <Tab.Content>
            {tab === "profile" && (
              <motion.div key="profile" {...fade}>
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white fw-bold fs-5">
                    <PersonFill className="me-2 text-primary" /> Personal Info
                  </Card.Header>
                  <Card.Body>
                    {!edit ? (
                      <div>
                        <p><b>Name:</b> {user.name}</p>
                        <p><b>Username:</b> {user.username}</p>
                        <p><b>Email:</b> {user.email}</p>
                        <p><b>Phone Number:</b> {user.phone}</p>
                        <Button variant="primary" onClick={handleEdit}>Edit Profile</Button>
                      </div>
                    ) : (
                      <Form onSubmit={handleProfileSave} autoComplete="off">
                        <Row>
                          <Col sm={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Full Name</Form.Label>
                              <Form.Control name="name" value={form.name || ""} onChange={handleChange} required autoFocus />
                            </Form.Group>
                          </Col>
                          <Col sm={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Username</Form.Label>
                              <Form.Control name="username" value={form.username || ""} onChange={handleChange} required />
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row>
                          <Col sm={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email</Form.Label>
                              <Form.Control type="email" name="email" value={form.email || ""} onChange={handleChange} required />
                            </Form.Group>
                          </Col>
                          <Col sm={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>phone</Form.Label>
                              <Form.Control name="phone" value={form.phone || ""} onChange={handleChange} placeholder="Optional" />
                            </Form.Group>
                          </Col>
                        </Row>
                        <div className="d-flex gap-2">
                          <Button type="submit" variant="success">Save</Button>
                          <Button variant="secondary" onClick={handleCancelEdit}>Cancel</Button>
                        </div>
                      </Form>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            )}
            {tab === "orders" && (
              <motion.div key="orders" {...fade}>
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white fw-bold fs-5">
                    <BoxSeam className="me-2 text-warning" /> Orders
                  </Card.Header>
                  <Card.Body>
                    {orders.length === 0 ? (
                      <div className="text-center text-muted py-5">No orders found.</div>
                    ) : (
                      <div>
                        {orders.map(order => (
                          <OrderCard
                            key={order._id}
                            order={order}
                            expanded={openOrder === order._id}
                            onToggle={() => setOpenOrder(openOrder === order._id ? null : order._id)}
                          />
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            )}
            {tab === "wishlist" && (
              <motion.div key="wishlist" {...fade}>
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white fw-bold fs-5">
                    <HeartFill className="me-2 text-danger" /> Wishlist
                  </Card.Header>
                  <Card.Body>
                    {wishlistAlert && <Alert variant={wishlistAlert.type} onClose={() => setWishlistAlert(null)} dismissible>{wishlistAlert.msg}</Alert>}
                    {wishlistLoading ? (
                      <div className="py-4 text-center">
                        <Spinner animation="border" role="status" size="sm" /> <span className="ms-2">Loading wishlist...</span>
                      </div>
                    ) : wishlist.length === 0 ? (
                      <div className="text-center py-5 text-muted">No wishlist items.</div>
                    ) : (
                      <div>
                        {wishlist.map(product => (
                          <WishlistProductCard
                            key={product._id}
                            product={product}
                            onRemove={() => handleRemoveWishlist(product._id || product.id)}
                          />
                        ))}
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            )}
            {tab === "password" && (
              <motion.div key="password" {...fade}>
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white fw-bold fs-5">
                    <ShieldLock className="me-2 text-danger" /> Change Password
                  </Card.Header>
                  <Card.Body>
                    {!pwdEditing ? (
                      <Button onClick={() => setPwdEditing(true)} variant="outline-danger">Change Password</Button>
                    ) : (
                      <Form onSubmit={handlePwdSave} autoComplete="off" className="mt-3" style={{ maxWidth: 340 }}>
                        <Form.Group className="mb-2">
                          <Form.Label>Old Password</Form.Label>
                          <Form.Control
                            name="old"
                            type="password"
                            value={pwd.old}
                            onChange={handlePwdChange}
                            minLength={6}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Label>New Password</Form.Label>
                          <Form.Control
                            name="new1"
                            type="password"
                            value={pwd.new1}
                            onChange={handlePwdChange}
                            minLength={6}
                            required
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Repeat New Password</Form.Label>
                          <Form.Control
                            name="new2"
                            type="password"
                            value={pwd.new2}
                            onChange={handlePwdChange}
                            minLength={6}
                            required
                          />
                        </Form.Group>
                        <div className="d-flex gap-2">
                          <Button type="submit" variant="warning">Update</Button>
                          <Button variant="secondary" onClick={() => { setPwd({ old: "", new1: "", new2: "" }); setPwdEditing(false); }}>Cancel</Button>
                        </div>
                      </Form>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            )}
            {tab === "address" && (
              <motion.div key="address" {...fade}>
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white fw-bold fs-5">
                    <GeoAltFill className="me-2 text-success" /> Addresses
                  </Card.Header>
                  <Card.Body>
                    {addressAlert && <Alert variant={addressAlert.type} dismissible onClose={() => setAddressAlert(null)}>{addressAlert.msg}</Alert>}
                    {addressLoading ? (
                      <div className="py-5 text-center"><Spinner animation="border" /></div>
                    ) : (
                      <>
                        {(editingAddress !== null) && (
                          <Card className="mb-4">
                            <Card.Body>
                              <Form onSubmit={handleAddressSave} autoComplete="off">
                                <Row>
                                  <Col md={6}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>Name</Form.Label>
                                      <Form.Control name="name" value={addressForm.name} onChange={handleAddressFormChange} required />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>Phone</Form.Label>
                                      <Form.Control name="phone" value={addressForm.phone} onChange={handleAddressFormChange} required maxLength={15} />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col md={4}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>Pincode</Form.Label>
                                      <Form.Control name="pincode" value={addressForm.pincode} onChange={handleAddressFormChange} required />
                                    </Form.Group>
                                  </Col>
                                  <Col md={4}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>City</Form.Label>
                                      <Form.Control name="city" value={addressForm.city} onChange={handleAddressFormChange} required />
                                    </Form.Group>
                                  </Col>
                                  <Col md={4}>
                                    <Form.Group className="mb-2">
                                      <Form.Label>State</Form.Label>
                                      <Form.Control name="state" value={addressForm.state} onChange={handleAddressFormChange} required />
                                    </Form.Group>
                                  </Col>
                                </Row>
                                <Form.Group className="mb-2">
                                  <Form.Label>Address</Form.Label>
                                  <Form.Control name="address" value={addressForm.address} onChange={handleAddressFormChange} required as="textarea" rows={2}/>
                                </Form.Group>
                                <Form.Group className="mb-2">
                                  <Form.Label>Landmark <span className="text-muted">(optional)</span></Form.Label>
                                  <Form.Control name="landmark" value={addressForm.landmark} onChange={handleAddressFormChange} />
                                </Form.Group>
                                <div className="d-flex gap-2 mb-2">
                                  <Button type="submit" variant="success">{editingAddress && editingAddress.id ? "Update" : "Add"} Address</Button>
                                  <Button variant="secondary" onClick={() => {setEditingAddress(null); resetAddressForm();}}>Cancel</Button>
                                </div>
                              </Form>
                            </Card.Body>
                          </Card>
                        )}
                        <div className="mb-3">
                          <Button variant="primary" size="sm"
                            onClick={() => {resetAddressForm(); setEditingAddress({});}}>Add New Address</Button>
                        </div>
                        {addresses.length === 0 ? (
                          <div className="text-center py-5 text-muted">No addresses saved yet. Add one to get started.</div>
                        ) : (
                          <>
                            {addresses.map(a => (
                              <Card key={a.id} className="mb-3 shadow address-card">
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                      <div className="fw-bold">
                                        {a.name} <span className="ms-2 text-secondary">{a.phone}</span>
                                        {a.isDefault && <Badge pill bg="success" className="ms-2">Default</Badge>}
                                      </div>
                                      <div>{a.address}, {a.city}, {a.state}, {a.pincode} {a.landmark && <span>({a.landmark})</span>}</div>
                                    </div>
                                    <div>
                                      {!a.isDefault && (
                                        <Button variant="outline-success" size="sm" className="me-2" onClick={() => handleSetDefault(a.id)}>Set as Default</Button>
                                      )}
                                      <Button variant="outline-info" size="sm" className="me-2" onClick={() => handleEditAddress(a)}>Edit</Button>
                                      <Button variant="outline-danger" size="sm" onClick={() => handleDeleteAddress(a.id)}>Delete</Button>
                                    </div>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                          </>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>
              </motion.div>
            )}
            {tab === "contact" && (
              <motion.div key="contact" {...fade}>
                <Card className="shadow-sm mb-4">
                  <Card.Header className="bg-white fw-bold fs-5">
                    <EnvelopeFill className="me-2 text-primary" /> Contact & Support
                  </Card.Header>
                  <Card.Body className="text-center">
                    <div className="py-4">
                      <div className="mb-3 fs-5">
                        <b>Need help?</b> We’d love to hear from you!
                      </div>
                      <Container>
                        <Row className="justify-content-center gy-3 mb-4">
                          <Col xs={12} md={4}>
                            <Card className="mb-2 h-100 border-0">
                              <Card.Body>
                                <div className="mb-2">
                                  <EnvelopeFill className="me-2 text-primary" />
                                  <b>Email</b>
                                </div>
                                <div>
                                  <a className="text-decoration-underline" href="mailto:mohittyagi0340@gmail.com">
                                    mohittyagi0340@gmail.com
                                  </a>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col xs={12} md={4}>
                            <Card className="mb-2 h-100 border-0">
                              <Card.Body>
                                <div className="mb-2">
                                  <GeoAltFill className="me-2 text-success" />
                                  <b>Address</b>
                                </div>
                                <div className="small">
                                  2nd Floor, Tech Building<br />
                                  Arki Fort,Solan,Himachal Pradesh, 173235<br />
                                  India
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                          <Col xs={12} md={4}>
                            <Card className="mb-2 h-100 border-0">
                              <Card.Body>
                                <div className="mb-2">
                                  <PhoneIcon className="me-2 text-warning" />
                                  <b>Call/WhatsApp</b>
                                </div>
                                <a href="tel:+919999999999" className="text-decoration-underline">
                                  +91 83530 56908
                                </a>
                                <br />
                                <a href="https://wa.me/918353056908" target="_blank" rel="noopener noreferrer" className="text-success text-decoration-underline">
                                  Message on WhatsApp
                                </a>
                              </Card.Body>
                            </Card>
                          </Col>
                        </Row>
                      </Container>
                      <div className="mb-3">
                        <span className="fw-semibold">Customer Care:</span> Available: <span className="text-primary">09:00 AM – 08:00 PM (IST), Mon-Sat</span>
                      </div>
                      <hr />
                      <div className="mb-4">
                        <b>Send us a message:</b>
                      </div>
                      <Container style={{ maxWidth: 540 }}>
                        {contactAlert && (
                          <Alert variant={contactAlert.type} dismissible onClose={() => setContactAlert(null)}>
                            {contactAlert.msg}
                          </Alert>
                        )}
                        <Form onSubmit={handleContactSubmit}>
                          <Row className="gy-2">
                            <Col xs={12} md={6}>
                              <Form.Control
                                type="text"
                                name="name"
                                placeholder="Name"
                                required
                                value={contactForm.name}
                                onChange={handleContactInput}
                              />
                            </Col>
                            <Col xs={12} md={6}>
                              <Form.Control
                                type="email"
                                name="email"
                                placeholder="Email"
                                required
                                value={contactForm.email}
                                onChange={handleContactInput}
                              />
                            </Col>
                          </Row>
                          <Row className="gy-2 mt-2">
                            <Col xs={12}>
                              <Form.Control
                                type="text"
                                name="subject"
                                placeholder="Subject (optional)"
                                value={contactForm.subject}
                                onChange={handleContactInput}
                              />
                            </Col>
                          </Row>
                          <Row className="gy-2 mt-2">
                            <Col xs={12}>
                              <Form.Control
                                as="textarea"
                                name="message"
                                rows={3}
                                placeholder="Your message..."
                                required
                                value={contactForm.message}
                                onChange={handleContactInput}
                              />
                            </Col>
                          </Row>
                          <div className="text-end mt-3">
                            <Button variant="primary" type="submit" disabled={contactLoading}>
                              {contactLoading ? (
                                <>
                                  <Spinner animation="border" size="sm" className="me-1" /> Sending...
                                </>
                              ) : (
                                <>Send <EnvelopeFill className="ms-1" /></>
                              )}
                            </Button>
                          </div>
                        </Form>
                        <div className="text-muted small mt-2 mb-0">
                          We'll reply within 24 hours on working days.
                        </div>
                      </Container>
                    </div>
                  </Card.Body>
                </Card>
              </motion.div>
            )}
          </Tab.Content>
        </Col>
      </Row>
    </Container>
  );
}

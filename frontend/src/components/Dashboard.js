import React, { useState, useEffect } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Dashboard = () => {
    // UI State
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Data State (Dashboard)
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);

    // --- NEW: BOOKING MODAL STATE ---
    const [bookingDoctor, setBookingDoctor] = useState(null); // The doctor we are booking with
    const [bookingDate, setBookingDate] = useState('');
    const [bookingTime, setBookingTime] = useState('');
    const [bookingMessage, setBookingMessage] = useState(null); // Success/Error messages
    const [isBooking, setIsBooking] = useState(false); // Loading state for the submit button

    const navigate = useNavigate();

    // 1. AUTH & INITIAL LOAD
    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                const userData = res.data;
                setUser(userData);
                if (userData.role === 'DOCTOR') navigate('/doctor-dashboard');
                else if (userData.role === 'ADMIN') navigate('/admin-dashboard');
                else {
                    fetchDepartments();
                    setLoading(false);
                }
            })
            .catch(() => {
                setUser(null);
                setLoading(false);
            });
    }, [navigate]);

    const fetchDepartments = () => {
        api.get('/departments')
            .then(res => { if (Array.isArray(res.data)) setDepartments(res.data); })
            .catch(err => console.error("Failed to load departments", err));
    };

    const handleDeptClick = (deptId) => {
        setSelectedDept(deptId);
        api.get(`/doctors/${deptId}`)
            .then(res => { if (Array.isArray(res.data)) setDoctors(res.data); })
            .catch(err => console.error("Failed to load doctors", err));
    };

    // --- NEW: MODAL HANDLERS ---
    const openBookingModal = (doctor) => {
        setBookingDoctor(doctor);
        setBookingMessage(null);
        setBookingDate('');
        setBookingTime('');
    };

    const closeBookingModal = () => {
        setBookingDoctor(null);
    };

    const submitBooking = () => {
        if (!bookingDate || !bookingTime) {
            setBookingMessage({ type: 'danger', text: 'Please select a date and time.' });
            return;
        }

        setIsBooking(true);
        // Combine Date and Time into ISO format (YYYY-MM-DDTHH:MM:SS)
        const appointmentDateTime = `${bookingDate}T${bookingTime}:00`;

        // 1. Changed URL to match Spring Boot mapping ("/appointments/book")
        api.post('/appointments/book', {
            doctorId: bookingDoctor.id,
            // 2. Changed property name from "appointmentTime" to "dateTime" to match Java DTO
            dateTime: appointmentDateTime

            // Note: I removed patientId and status because your Spring Boot controller
            // safely handles the patient via the Authentication token and should
            // set the status to PENDING by default in the service layer!
        })
            .then(() => {
                setBookingMessage({ type: 'success', text: 'Appointment booked successfully!' });
                // Close modal after 2 seconds
                setTimeout(() => {
                    closeBookingModal();
                    setIsBooking(false);
                }, 2000);
            })
            .catch(err => {
                console.error(err);
                setBookingMessage({ type: 'danger', text: 'Failed to book. Please try again.' });
                setIsBooking(false);
            });
    };


    // --- LOADING VIEW ---
    if (loading) {
        return <div className="d-flex justify-content-center align-items-center vh-100"><div className="spinner-border text-primary"></div></div>;
    }

    // --- VIEW 1: GUEST LANDING PAGE ---
    if (!user) {
        // (Keep your existing Guest Landing Page code here exactly as it was)
        // For brevity, I am putting the SERVER_URL logic here
        const SERVER_URL = process.env.REACT_APP_API_URL
            ? process.env.REACT_APP_API_URL.replace('/api', '')
            : 'https://localhost:8080';

        return (
            <div className="container-fluid p-0 fade-in">
                <div className="bg-primary text-white text-center py-5" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0099ff 100%)' }}>
                    <div className="container py-5">
                        <i className="bi bi-heart-pulse-fill display-1 mb-3"></i>
                        <h1 className="display-3 fw-bold">Smart Hospital System</h1>
                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <a href={`${SERVER_URL}/login`} className="btn btn-light btn-lg fw-bold px-5 rounded-pill shadow-lg text-primary">Login to Book</a>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: PATIENT DASHBOARD ---
    if (user.role !== 'PATIENT') return null;

    return (
        <div className="position-relative">
            {/* Dashboard Header */}
            <div className="bg-light py-5 mb-5 border-bottom">
                <div className="container text-center">
                    <h1 className="display-5 fw-bold text-primary">Welcome back, {user.fullName}!</h1>
                    <p className="lead text-muted">Select a department below to find a doctor.</p>
                </div>
            </div>

            <div className="container pb-5">
                <div className="row g-4">
                    {/* Sidebar: Departments */}
                    <div className="col-md-3">
                        <div className="card shadow-sm border-0">
                            <div className="card-header bg-white fw-bold text-uppercase small text-muted py-3">
                                <i className="bi bi-grid me-2"></i> Departments
                            </div>
                            <div className="list-group list-group-flush">
                                {departments.map(dept => (
                                    <button
                                        key={dept.id}
                                        className={`list-group-item list-group-item-action py-3 border-0 d-flex justify-content-between align-items-center ${selectedDept === dept.id ? 'bg-primary text-white shadow-sm rounded' : 'text-secondary'}`}
                                        onClick={() => handleDeptClick(dept.id)}
                                    >
                                        <span><i className="bi bi-hospital me-2"></i>{dept.name}</span>
                                        {selectedDept === dept.id && <i className="bi bi-chevron-right"></i>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Doctors */}
                    <div className="col-md-9">
                        {!selectedDept ? (
                            <div className="text-center py-5 text-muted bg-light rounded-3 border border-dashed h-100 d-flex flex-column justify-content-center align-items-center">
                                <i className="bi bi-arrow-left-circle display-4 d-block mb-3 opacity-25"></i>
                                <h5>Please select a department from the left menu</h5>
                            </div>
                        ) : (
                            <>
                                <h4 className="mb-4 text-primary border-bottom pb-2">Available Specialists</h4>
                                <div className="row g-3">
                                    {doctors.length === 0 ? <p className="text-muted">No doctors found.</p> : doctors.map(doc => (
                                        <div className="col-md-6 col-lg-4" key={doc.id}>
                                            <div className="card h-100 shadow-sm border-0 hover-effect text-center p-3">
                                                <div className="card-body">
                                                    <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex p-3 mb-3 text-primary">
                                                        <i className="bi bi-person-workspace fs-1"></i>
                                                    </div>
                                                    <h5 className="card-title fw-bold mb-1">Dr. {doc.user?.fullName || doc.user?.username}</h5>
                                                    <p className="badge bg-light text-secondary mb-3">{doc.specialization}</p>

                                                    {/* UPDATED BUTTON: Opens Modal instead of navigating */}
                                                    <button
                                                        className="btn btn-outline-primary w-100 rounded-pill mt-2 fw-bold"
                                                        onClick={() => openBookingModal(doc)}
                                                    >
                                                        Book Appointment
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* --- BOOKING MODAL (Overlay) --- */}
            {bookingDoctor && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header bg-primary text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-calendar-check me-2"></i>
                                    Book with Dr. {bookingDoctor.user?.fullName || bookingDoctor.user?.username}
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={closeBookingModal}></button>
                            </div>
                            <div className="modal-body p-4">
                                {bookingMessage && (
                                    <div className={`alert alert-${bookingMessage.type} mb-3`} role="alert">
                                        {bookingMessage.text}
                                    </div>
                                )}

                                <form>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Select Date</label>
                                        <input
                                            type="date"
                                            className="form-control form-control-lg"
                                            value={bookingDate}
                                            min={new Date().toISOString().split('T')[0]} // Prevent past dates
                                            onChange={(e) => setBookingDate(e.target.value)}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label text-muted small fw-bold text-uppercase">Select Time</label>
                                        <input
                                            type="time"
                                            className="form-control form-control-lg"
                                            value={bookingTime}
                                            onChange={(e) => setBookingTime(e.target.value)}
                                        />
                                    </div>
                                </form>
                            </div>
                            <div className="modal-footer bg-light">
                                <button type="button" className="btn btn-secondary" onClick={closeBookingModal}>Cancel</button>
                                <button
                                    type="button"
                                    className="btn btn-primary px-4 fw-bold"
                                    onClick={submitBooking}
                                    disabled={isBooking}
                                >
                                    {isBooking ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                    Confirm Booking
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
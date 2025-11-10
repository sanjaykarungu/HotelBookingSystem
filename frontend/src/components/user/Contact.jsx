import React, { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Form submitted:", formData);
      alert("Thank you for your message! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FaPhone className="w-6 h-6" />,
      title: "Phone",
      details: "+91 638 131 7616",
      subtitle: "Mon to Fri 9am to 6pm",
    },
    {
      icon: <FaEnvelope className="w-6 h-6" />,
      title: "Email",
      details: "sanjaykarungu4690@gmail.com",
      subtitle: "Send us your query anytime",
    },
    {
      icon: <FaMapMarkerAlt className="w-6 h-6" />,
      title: "Office",
      details: "123 Thiruppalai, Madurai",
      subtitle: "Tamil Nadu, India - 625014",
    },
    {
      icon: <FaClock className="w-6 h-6" />,
      title: "Support Hours",
      details: "24/7 Customer Support",
      subtitle: "We're always here to help",
    },
  ];

  const socialLinks = [
    {
      icon: <FaFacebook className="w-5 h-5" />,
      name: "Facebook",
      url: "https://facebook.com",
    },
    {
      icon: <FaTwitter className="w-5 h-5" />,
      name: "Twitter",
      url: "https://twitter.com",
    },
    {
      icon: <FaInstagram className="w-5 h-5" />,
      name: "Instagram",
      url: "https://instagram.com",
    },
    {
      icon: <FaWhatsapp className="w-5 h-5" />,
      name: "WhatsApp",
      url: "https://wa.me/916381317616",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Contact Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get in touch with our team. We're here to help you with all your
            hotel booking needs.
          </p>
          <div className="w-20 h-1 bg-blue-600 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Contact Information */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Get in Touch
              </h2>
              <p className="text-gray-600 mb-6">
                Have questions about our services? Need help with your booking?
                Our dedicated support team is ready to assist you 24/7.
              </p>
            </div>

            {/* Contact Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {item.title}
                      </h3>
                      <p className="text-gray-900 font-medium text-sm truncate">
                        {item.details}
                      </p>
                      <p className="text-gray-500 text-xs">{item.subtitle}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3">Follow Us</h3>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors duration-300"
                    aria-label={social.name}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* FAQ Quick Links */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Help</h3>
              <ul className="space-y-1 text-blue-700 text-sm">
                <li>
                  <a href="#" className="hover:underline block py-1">
                    Booking Modifications
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline block py-1">
                    Cancellation Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline block py-1">
                    Payment Issues
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline block py-1">
                    Hotel Facilities
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Send us a Message
            </h2>
            <p className="text-gray-600 mb-6">
              We typically respond within 2 hours
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select a subject</option>
                    <option value="booking">Booking Assistance</option>
                    <option value="modification">Booking Modification</option>
                    <option value="cancellation">Cancellation Request</option>
                    <option value="payment">Payment Issue</option>
                    <option value="refund">Refund Inquiry</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-vertical"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transform hover:scale-105"
                } text-white`}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              <p className="text-center text-gray-500 text-xs">
                By submitting this form, you agree to our privacy policy.
              </p>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <div className="text-center">
              <FaMapMarkerAlt className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Our Location
              </h3>
              <p className="text-gray-600 text-sm">
                123 Thiruppalai, Madurai, Tamilnadu, India - 625014
              </p>
              <button className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-sm">
                <a href="https://www.google.com/maps/place/Madurai,+Tamil+Nadu/@9.9178268,78.0404216,12z/data=!3m1!4b1!4m6!3m5!1s0x3b00c582b1189633:0xdc955b7264f63933!8m2!3d9.9252007!4d78.1197754!16zL20vMDE5ZmJw?entry=ttu&g_ep=EgoyMDI1MTAxNS4wIKXMDSoASAFQAw%3D%3D">
                  {" "}
                  View on Google Maps
                </a>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

import React from 'react'

const Footer = () => {
  const footerSections = [
    {
      title: "Top Destinations",
      items: ["Dubai", "Paris", "London", "New York", "Bangkok", "Singapore", "Chennai", "Hyderabad", "Bengaluru", "Kolkata"]
    },
    {
      title: "Top Countries & Regions",
      items: ["Maldives", "Singapore", "Mauritius", "Seychelles", "Sri Lanka", "India", "Mumbai"]
    },
    {
      title: "Support",
      items: ["Your bookings", "Contact us", "Review a property", "FAQs", "Customer support"]
    },
    {
      title: "Partners",
      items: ["Affiliate with us", "Newsroom", "Partner Solutions", "Promote with us", "Travel Agents"]
    },
    {
      title: "Policies",
      items: ["Terms & Conditions", "Privacy", "Cookies", "Content guidelines", "Accessibility"]
    },
    {
      title: "Company",
      items: ["About us", "Careers", "Travel Guides", "Press", "Investor relations"]
    }
  ];

  return (
    <div className='bg-gray-900 pt-12 pb-8'>
      <footer className='max-w-7xl mx-auto px-5'>
        {/* Main Footer Content */}
        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6'>
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className='font-semibold text-white text-base mb-4'>{section.title}</h3>
              <div className='space-y-2'>
                {section.items.map((item, itemIndex) => (
                  <p 
                    key={itemIndex} 
                    className='text-gray-400 hover:text-white cursor-pointer transition-colors duration-200 text-xs'
                  >
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Copyright Section */}
        <div className='border-t border-gray-800 mt-8 pt-6'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <div className='text-gray-400 text-xs mb-4 md:mb-0'>
              <p>© 2024 Hotel-Booking.com - Your trusted travel partner</p>
            </div>
            <div className='flex gap-4'>
              <span className='text-gray-400 hover:text-white cursor-pointer text-xs'>Privacy</span>
              <span className='text-gray-400 hover:text-white cursor-pointer text-xs'>Terms</span>
              <span className='text-gray-400 hover:text-white cursor-pointer text-xs'>Sitemap</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
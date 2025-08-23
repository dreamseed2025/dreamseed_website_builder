'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Launch Your Dream Business With One Click</h1>
            <p>Skip the paperwork and get started today with our AI-powered business builder.</p>
            <Link href="/business-assessment" className="cta-button">Get Started Now</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>Why Choose Dream Seed?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>🚀 AI-Powered Setup</h3>
              <p>Our advanced AI guides you through every step of business formation, making complex legal processes simple and fast.</p>
            </div>
            <div className="feature-card">
              <h3>⚡ Lightning Fast</h3>
              <p>Get your business up and running in minutes, not weeks. Our streamlined process eliminates delays and bureaucracy.</p>
            </div>
            <div className="feature-card">
              <h3>💰 Cost Effective</h3>
              <p>Save thousands on legal fees with our automated system. Premium business formation at a fraction of traditional costs.</p>
            </div>
            <div className="feature-card">
              <h3>🛡️ Legally Compliant</h3>
              <p>Rest assured knowing your business is properly formed with all legal requirements met and documented.</p>
            </div>
            <div className="feature-card">
              <h3>📱 Dashboard Control</h3>
              <p>Monitor your business formation progress with our intuitive dashboard and real-time updates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="services">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <img src="https://kxldodhrhqbwyvgyuqfd.supabase.co/storage/v1/object/public/webimages/dream_seed_5.png" alt="Formation & Legal Setup" className="service-image" />
              <div className="service-content">
                <h3>Formation & Legal Setup</h3>
                <p>Complete business entity formation including LLC, Corporation, and Partnership setup with all required legal documentation.</p>
                <ul>
                  <li>Business entity selection</li>
                  <li>Articles of incorporation</li>
                  <li>Operating agreements</li>
                  <li>Legal compliance review</li>
                </ul>
              </div>
            </div>
            <div className="service-card">
              <img src="https://kxldodhrhqbwyvgyuqfd.supabase.co/storage/v1/object/public/webimages/dream_seed_6.png" alt="Tax & Financial Setup" className="service-image" />
              <div className="service-content">
                <h3>Tax & Financial Setup</h3>
                <p>Comprehensive tax registration, EIN acquisition, and financial account setup to get your business financially ready.</p>
                <ul>
                  <li>EIN registration</li>
                  <li>Tax ID setup</li>
                  <li>Business banking guidance</li>
                  <li>Accounting system integration</li>
                </ul>
              </div>
            </div>
            <div className="service-card">
              <img src="https://kxldodhrhqbwyvgyuqfd.supabase.co/storage/v1/object/public/webimages/dream_seed_7.png" alt="Compliance & Ongoing Support" className="service-image" />
              <div className="service-content">
                <h3>Compliance & Ongoing Support</h3>
                <p>Ongoing compliance monitoring, annual filings, and business support to keep your company in good standing.</p>
                <ul>
                  <li>Annual state filings</li>
                  <li>Compliance monitoring</li>
                  <li>Business support</li>
                  <li>Legal update notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq">
        <div className="container">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            <div className="faq-item">
              <div className="faq-question">How long does business formation take?</div>
              <div className="faq-answer">Most business formations are completed within 24-48 hours. Complex structures may take up to 5 business days.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">What documents do I need to provide?</div>
              <div className="faq-answer">You'll need basic information like business name, address, and owner details. Our AI will guide you through exactly what's needed.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Is my business legally compliant?</div>
              <div className="faq-answer">Yes, all formations meet state and federal requirements. We ensure full legal compliance for your business entity.</div>
            </div>
            <div className="faq-item">
              <div className="faq-question">Can I track my formation progress?</div>
              <div className="faq-answer">Absolutely! Use our Dashboard to monitor every step of your business formation process in real-time.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact">
        <div className="container">
          <h2>Get Started Today</h2>
          <div className="contact-content">
            <div className="contact-item">
              <h3>📧 Email Support</h3>
              <p><a href="mailto:support@dreamseed.ai">support@dreamseed.ai</a></p>
              <p>24/7 customer support for all your business formation needs</p>
            </div>
            <div className="contact-item">
              <h3>💬 Live Chat</h3>
              <p>Get instant answers to your questions</p>
              <p>Available Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
            <div className="contact-item">
              <h3>📞 Phone Support</h3>
              <p><a href="tel:+1-555-DREAM-BIZ">+1 (555) DREAM-BIZ</a></p>
              <p>Speak directly with our business formation experts</p>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        /* Hero Section */
        .hero {
          background: linear-gradient(135deg, #141416 0%, #3348a8 100%);
          color: white;
          padding: 8rem 0 4rem;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: url('https://kxldodhrhqbwyvgyuqfd.supabase.co/storage/v1/object/public/webimages/dream_seed_1.png') center/cover;
          opacity: 0.1;
        }

        .hero-content {
          position: relative;
          z-index: 2;
        }

        .hero h1 {
          font-family: 'Poppins', sans-serif;
          font-size: 3.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          line-height: 1.2;
        }

        .hero p {
          font-size: 1.3rem;
          margin-bottom: 2rem;
          opacity: 0.9;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-button {
          background: #56b978;
          color: white;
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
          font-weight: 600;
        }

        .cta-button:hover {
          background: #4a9d66;
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(86, 185, 120, 0.3);
        }

        /* Features Section */
        .features {
          padding: 4rem 0;
          background: #f8f9fa;
        }

        .features h2 {
          text-align: center;
          font-family: 'Poppins', sans-serif;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #141416;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 2rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          text-align: center;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .feature-card h3 {
          color: #3348a8;
          margin-bottom: 1rem;
          font-size: 1.3rem;
        }

        /* Services Section */
        .services {
          padding: 4rem 0;
        }

        .services h2 {
          text-align: center;
          font-family: 'Poppins', sans-serif;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #141416;
        }

        .services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .service-card {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          transition: transform 0.3s ease;
        }

        .service-card:hover {
          transform: translateY(-5px);
        }

        .service-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        .service-content {
          padding: 2rem;
        }

        .service-content h3 {
          color: #3348a8;
          margin-bottom: 1rem;
          font-size: 1.4rem;
        }

        .service-content ul {
          list-style: none;
          padding: 0;
          margin-top: 1rem;
        }

        .service-content li {
          padding: 0.25rem 0;
          color: #666;
        }

        .service-content li::before {
          content: '✓ ';
          color: #56b978;
          font-weight: bold;
        }

        /* FAQ Section */
        .faq {
          padding: 4rem 0;
          background: #f8f9fa;
        }

        .faq h2 {
          text-align: center;
          font-family: 'Poppins', sans-serif;
          font-size: 2.5rem;
          margin-bottom: 3rem;
          color: #141416;
        }

        .faq-item {
          background: white;
          margin-bottom: 1rem;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .faq-question {
          background: #3348a8;
          color: white;
          padding: 1.5rem;
          font-weight: 600;
          cursor: pointer;
        }

        .faq-answer {
          padding: 1.5rem;
          color: #555;
        }

        /* Contact Section */
        .contact {
          padding: 4rem 0;
          background: #141416;
          color: white;
        }

        .contact h2 {
          text-align: center;
          font-family: 'Poppins', sans-serif;
          font-size: 2.5rem;
          margin-bottom: 3rem;
        }

        .contact-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 3rem;
          text-align: center;
        }

        .contact-item h3 {
          color: #56b978;
          margin-bottom: 1rem;
        }

        .contact-item a {
          color: white;
          text-decoration: none;
        }

        .contact-item a:hover {
          color: #56b978;
        }

        /* General */
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2.5rem;
          }
          
          .hero p {
            font-size: 1.1rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .services-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}
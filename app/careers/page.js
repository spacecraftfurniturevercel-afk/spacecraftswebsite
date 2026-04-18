export const metadata = {
  title: 'Careers | Spacecrafts Furniture',
  description: 'Join the Spacecrafts Furniture team. Explore open positions and build your career with us.',
}

export default function CareersPage() {
  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '60px 20px', fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a', marginBottom: 8 }}>Careers</h1>
      <p style={{ fontSize: 16, color: '#6b7280', marginBottom: 48, borderBottom: '1px solid #e5e7eb', paddingBottom: 32 }}>
        Join our team and help us bring beautiful furniture into every home.
      </p>

      {/* About working here */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>Why Spacecrafts Furniture?</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 12 }}>
          We are a fast-growing premium furniture brand based in Chennai, Tamil Nadu. We believe that great furniture transforms spaces and improves lives. Our team is passionate about design, quality, and customer experience.
        </p>
        <ul style={{ fontSize: 15, color: '#374151', lineHeight: 2, paddingLeft: 20 }}>
          <li>Competitive salary and growth opportunities</li>
          <li>Collaborative, respectful work culture</li>
          <li>Employee discounts on all products</li>
          <li>Opportunities across sales, logistics, design, and technology</li>
        </ul>
      </section>

      {/* Open Positions */}
      <section style={{ marginBottom: 48 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', marginBottom: 24 }}>Open Positions</h2>
        {[
          { role: 'Sales Executive', type: 'Full-time', location: 'Chennai, Tamil Nadu' },
          { role: 'Delivery & Logistics Associate', type: 'Full-time', location: 'Chennai, Tamil Nadu' },
          { role: 'Customer Support Representative', type: 'Full-time / Remote', location: 'Chennai / Remote' },
          { role: 'E-commerce & Marketing Assistant', type: 'Full-time', location: 'Chennai, Tamil Nadu' },
        ].map((job) => (
          <div key={job.role} style={{
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '20px 24px',
            marginBottom: 16,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', marginBottom: 4 }}>{job.role}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{job.location} &nbsp;·&nbsp; {job.type}</div>
            </div>
            <a
              href={`mailto:spacecraftsdigital@gmail.com?subject=Application for ${job.role}&body=Hi, I am interested in the ${job.role} position. Please find my details below:%0A%0AName:%0APhone:%0AExperience:`}
              style={{
                background: '#1a1a1a',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Apply via Email
            </a>
          </div>
        ))}
      </section>

      {/* Contact */}
      <section style={{
        background: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        padding: '28px 32px',
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Don&apos;t see a role for you?</h2>
        <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 16 }}>
          Send us your CV and a short introduction. We&apos;re always looking for talented people.
        </p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <a
            href="mailto:spacecraftsdigital@gmail.com?subject=General Application&body=Hi, I'd like to be considered for future openings.%0A%0AName:%0APhone:%0ASkills / Experience:"
            style={{
              background: '#1a1a1a',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Email Your CV
          </a>
          <a
            href="https://wa.me/919003003733?text=Hi, I'm interested in career opportunities at Spacecrafts Furniture."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#25D366',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: 6,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            WhatsApp Us
          </a>
        </div>
      </section>
    </main>
  )
}

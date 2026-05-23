import { Crown, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { HOSTEL_INFO } from "@/data/hostelData";

function openExternal(url: string) {
  const a = document.createElement("a");
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// SVG icons for Facebook & Instagram (no external dep)
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    url: "https://m.facebook.com/profile.php?id=379080338616298&ref=xav_ig_profile_page&wtsid=rdr_0gfATj04otH9CXRl4&hr=1",
    icon: <FacebookIcon />,
  },
  {
    label: "Instagram",
    url: "https://www.instagram.com/majestichostel.pk?igsh=MWhsYWdoa2p0MXkzNg==",
    icon: <InstagramIcon />,
  },
  {
    label: "WhatsApp",
    url: `https://wa.me/${HOSTEL_INFO.whatsapp}`,
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.49"/>
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-border/40 bg-card/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-gold flex items-center justify-center shadow-gold">
                <Crown className="w-5 h-5 text-background" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-gold-gradient">Majestic Girls Hostel</h3>
                <p className="text-xs text-muted-foreground tracking-widest uppercase">Your Second Home</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-5">
              Safe, disciplined, and supportive environment where every student can thrive academically and personally.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ label, url, icon }) => (
                <button
                  key={label}
                  onClick={() => openExternal(url)}
                  title={`Follow us on ${label}`}
                  className="w-9 h-9 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 flex items-center justify-center hover:scale-110 active:scale-95"
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-primary mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              {[["Rooms", "/rooms"], ["Facilities", "/facilities"], ["Gallery", "/gallery"], ["Booking", "/booking"], ["Contact", "/contact"]].map(([label, href]) => (
                <Link key={href} to={href} className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-widest text-primary mb-4">Contact</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <button
                  onClick={() => openExternal(`https://maps.google.com/?q=${encodeURIComponent(HOSTEL_INFO.address)}`)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors text-left flex items-center gap-1"
                >
                  {HOSTEL_INFO.address}
                  <ExternalLink className="w-3 h-3 shrink-0" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-primary shrink-0" />
                <a href={`tel:${HOSTEL_INFO.phone}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {HOSTEL_INFO.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary shrink-0" />
                <a href={`mailto:${HOSTEL_INFO.email}`} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {HOSTEL_INFO.email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2025 Majestic Girls Hostel. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-primary transition-colors">Student Login</Link>
            <span className="text-muted-foreground/30">|</span>
            <Link to="/warden-login" className="text-xs text-muted-foreground hover:text-primary transition-colors">Warden</Link>
          </div>
        </div>
      </div>

      {/* Ambient glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary/5 blur-3xl rounded-full pointer-events-none" />
    </footer>
  );
}

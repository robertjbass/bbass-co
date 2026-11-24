import { contactInfo } from '@/lib/data'

export function SiteFooter() {
  return (
    <footer className="profile-footer">
      <div className="profile-width">
        <span>
          © {new Date().getFullYear()} {contactInfo.name}
        </span>
        <span>Austin, Texas</span>
      </div>
    </footer>
  )
}

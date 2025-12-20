export function Footer() {
  return (
    <footer className="bg-muted py-8 mt-auto">
      <div className="container mx-auto px-4 text-center relative group">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Janji Pria. All rights reserved.
        </p>
        <a 
          href="/secret-login" 
          className="absolute bottom-0 right-4 p-2 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
          aria-label="Secret Access"
        >
          <span className="sr-only">Secret</span>
          🔒
        </a>
      </div>
    </footer>
  );
}

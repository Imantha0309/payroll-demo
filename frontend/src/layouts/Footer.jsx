// -----------------------|| FOOTER ||-----------------------//

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="pc-footer">
      <div className="footer-wrapper container-fluid">
        <div className="row">
          <div className="col my-1">
            <span className="text-muted">
              © {currentYear} PM Office | Sri Lanka. All rights reserved.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

import DOMPurify from 'dompurify';
import PropTypes from 'prop-types';

const SafeHTML = ({ html }) => {
  const sanitizedHTML = DOMPurify.sanitize(html);

  return <div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />;
};

SafeHTML.propTypes = {
  html: PropTypes.string.isRequired,
};

export default SafeHTML;

import React from 'react';
import PartialsCarousel from './partials/carousel';
import PropTypes from 'prop-types';

const Browse = ({ categories }) => {
    if (!categories || categories.length === 0) {
        return null;
    }

    return (
        <div className="browse-container">
            {categories.map(category => (
                <PartialsCarousel 
                    key={category.id}
                    title={category.name}
                    books={category.books || []}
                    category={category}
                />
            ))}
        </div>
    );
};

Browse.propTypes = {
    categories: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            name: PropTypes.string.isRequired,
            books: PropTypes.array,
        })
    ).isRequired,
};

export default Browse;








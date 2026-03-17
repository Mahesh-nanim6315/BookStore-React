import React from 'react';
import PartialsCarousel from './partials/carousel';

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

export default Browse;








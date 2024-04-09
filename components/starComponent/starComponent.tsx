import { transform } from '@babel/core';
import React from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';

interface StarRatingProps {
  rating: number | undefined;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const effectiveRating = rating || 0;

  const renderStars = () => {
    const stars = [];

    for (let i = 0; i < 5; i++) {
      if (i < Math.floor(effectiveRating)) {
        // Estrela inteira
        stars.push(<Icon key={i} name="star" size={20} color="orange" />);
      } else if (i < Math.ceil(effectiveRating)) {
        // Meia estrela
        stars.push(
          <View key={i} style={{ flexDirection: 'row', gap: -2}}>
            <Icon name="star-half" size={20} color="orange" />
            <Icon name="star-half" size={20} color="gray" style={{ transform: [{ scaleX: -1 }] }} />
          </View>
        );
      } else {
        // Estrela vazia
        stars.push(<Icon key={i} name="star" size={20} color="gray" />);
      }
    }

    return stars;
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center'}}>
      {renderStars()}
    </View>
  );
};

export default StarRating;

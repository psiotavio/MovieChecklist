import React from 'react';
import { View, StyleSheet } from 'react-native';
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
        // Meia estrela customizada
        stars.push(
          <View key={i} style={styles.halfStarContainer}>
            <Icon name="star" size={20} color="orange" style={styles.halfStarLeft} />
            <Icon name="star" size={20} color="gray" style={styles.halfStarRight} />
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
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      {renderStars()}
    </View>
  );
};

const styles = StyleSheet.create({
  halfStarContainer: {
    position: 'relative',
    width: 20,
    height: 20,
  },
  halfStarLeft: {
    position: 'absolute',
    left: 0,
    width: 10,
    overflow: 'hidden',
  },
  halfStarRight: {
    position: 'absolute',
    right: 0.5,
    width: 10,
    overflow: 'hidden',
    transform: [{ scaleX: -1 }],
  },
});

export default StarRating;

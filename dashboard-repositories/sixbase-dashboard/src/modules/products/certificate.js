import React from 'react';
import { useState } from 'react';
import { Stage, Layer, Star, Text } from 'react-konva';

function generateShapes() {
  return [...Array(1)].map((_, i) => ({
    id: i.toString(),
    x: 200,
    y: 200,
    rotation: Math.random() * 180,
    isDragging: false,
  }));
}
const INITIAL_STATE = generateShapes();

const Certificate = () => {
  const [stars, setStars] = React.useState(INITIAL_STATE);
  const [x, setX] = useState(100);
  const [y, setY] = useState(100);
  const [fontSize, setFontSize] = useState(40);

  const handleDragStart = (e) => {
    const id = e.target.id();
    setStars(
      stars.map((star) => {
        return {
          ...star,
          isDragging: star.id === id,
        };
      })
    );
  };
  const handleDragEnd = () => {
    setStars(
      stars.map((star) => {
        return {
          ...star,
          isDragging: false,
        };
      })
    );
  };

  const dragEnd = (e) => {
    setX(e.target.attrs.x);
    setY(e.target.attrs.y);
  };

  return (
    <div>
      <h3>Certificado</h3>
      {x}
      <br></br>
      {y}
      <select
        defaultValue={fontSize}
        onChange={(e) => {
          setFontSize(e.target.value);
        }}
      >
        <option value='24'>24</option>
        <option value='32'>32</option>
        <option value='40'>40</option>
        <option value='48'>48</option>
        <option value='60'>60</option>
      </select>
      <div
        id='teste'
        style={{
          display: 'inline-block',
          border: '1px solid black',
          backgroundImage: 'URL(https://i.imgur.com/qnxs0NZ.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center center',
        }}
      ></div>
      <Stage container='teste' width={1056} height={750}>
        <Layer>
          <Text
            text='[nome_aluno]'
            fontSize={fontSize}
            fontFamily={'Verdana'}
            fill='rgba(0,0,0,0.7)'
            draggable
            x={x}
            y={y}
            onDragEnd={dragEnd}
            align='center'
            strokeEnabled={true}
            stroke={'#ff0000'}
            strokeWidth={1}
          />
          {stars.map((star) => (
            <Star
              key={star.id}
              id={star.id}
              x={star.x}
              y={star.y}
              numPoints={5}
              innerRadius={20}
              outerRadius={40}
              fill='#ff0000'
              opacity={0.9}
              draggable
              rotation={0}
              shadowColor='black'
              shadowBlur={10}
              shadowOpacity={0.6}
              shadowOffsetX={star.isDragging ? 10 : 5}
              shadowOffsetY={star.isDragging ? 10 : 5}
              scaleX={star.isDragging ? 1.1 : 1}
              scaleY={star.isDragging ? 1.1 : 1}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default Certificate;

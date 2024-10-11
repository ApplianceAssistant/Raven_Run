export const metersToFeet = (meters) => {
    return meters * 3.28084;
  };
  
  export const feetToMeters = (feet) => {
    return feet / 3.28084;
  };
  
  export const kilometersToMiles = (kilometers) => {
    return kilometers * 0.621371;
  };
  
  export const milesToKilometers = (miles) => {
    return miles / 0.621371;
  };
  
  export const getSmallDistanceUnit = (isMetric) => {
    return isMetric ? 'm' : 'ft';
  };
  
  export const getLargeDistanceUnit = (isMetric) => {
    return isMetric ? 'km' : 'mi';
  };
  
  export const convertDistance = (distance, fromMetric, toMetric) => {
    if (fromMetric === toMetric) return distance;
    return fromMetric ? kilometersToMiles(distance) : milesToKilometers(distance);
  };
  
  export const convertSmallDistance = (distance, fromMetric, toMetric) => {
    if (fromMetric === toMetric) return distance;
    return fromMetric ? metersToFeet(distance) : feetToMeters(distance);
  };
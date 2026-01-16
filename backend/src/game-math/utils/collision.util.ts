/**
 * Collision Detection Utilities
 * 
 * Simple collision detection for Tu Tien game
 * Uses AABB (Axis-Aligned Bounding Box) and Circle collision
 */

export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Circle {
  x: number;
  y: number;
  radius: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Check if two rectangles collide (AABB collision)
 */
export function rectRectCollision(rect1: Rectangle, rect2: Rectangle): boolean {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

/**
 * Check if two circles collide
 */
export function circleCircleCollision(
  circle1: Circle,
  circle2: Circle,
): boolean {
  const dx = circle1.x - circle2.x;
  const dy = circle1.y - circle2.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance < circle1.radius + circle2.radius;
}

/**
 * Check if a point is inside a rectangle
 */
export function pointRectCollision(point: Point, rect: Rectangle): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

/**
 * Check if a point is inside a circle
 */
export function pointCircleCollision(point: Point, circle: Circle): boolean {
  const dx = point.x - circle.x;
  const dy = point.y - circle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= circle.radius;
}

/**
 * Check if a circle and rectangle collide
 */
export function circleRectCollision(circle: Circle, rect: Rectangle): boolean {
  // Find the closest point on the rectangle to the circle center
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calculate distance from circle center to closest point
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  return distance <= circle.radius;
}

/**
 * Calculate distance between two points
 */
export function distance(point1: Point, point2: Point): number {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if distance is within range (for skill range checks)
 */
export function isInRange(
  point1: Point,
  point2: Point,
  range: number,
): boolean {
  return distance(point1, point2) <= range;
}


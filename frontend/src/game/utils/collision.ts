/**
 * Collision Detection Utilities (Frontend)
 * 
 * Simple collision detection for client-side validation
 * Server should always validate collisions for security
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


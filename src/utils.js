let e = 0.00000000001; //espilon, for float comparison

function eq(a, b) {
  return distance(a, b) < e;
}

function flatten(array) {
  return [].concat(...array);
}

function add([ax, ay], [bx, by]) {
  return [ax + bx, ay + by];
}

function sub([ax, ay], [bx, by]) {
  return [ax - bx, ay - by];
}

function multiply([x, y], c) {
  return [x * c, y * c];
}

function magnitude([x, y]) {
  return Math.sqrt(x * x + y * y);
}

function normalize(v) {
  return multiply(v, 1 / magnitude(v));
}

function distance([ax, ay], [bx, by]) {
  let s = [ax - bx, ay - by];
  return Math.sqrt(Math.pow(s[0], 2) + Math.pow(s[1], 2));
}

function partition(wallPoints) {
  //break up a list of points into a list of contiguous segments
  return wallPoints.map((p, i, a) => [p, a[(i + 1) % a.length]]);
}

function slope([ax, ay], [bx, by]) {
  //using slope as a scalar instead of a vector was a mistake
  return (ay - by) / (ax - bx);
}

function offset([ax, ay], [bx, by]) {
  let s = slope([ax, ay], [bx, by]);
  return ay - s * ax;
}

function findY(x, s, o) {
  //find y given slope and offset
  return x * s + o;
}

function interpolate([a, b]) {
  //get a list of points along a segment
  let lim = distance(a, b);
  let s = 20;
  let samples = [a];

  for (let i = s; i < lim; i += s) {
    let r = i / lim;
    samples.push(add(multiply(a, r), multiply(b, 1 - r)));
  }
  samples.push(b);
  return samples;
}

function resample(wallPoints) {
  //build samples along segments to get more checking points
  let wp = partition(wallPoints);
  return flatten(wp.map(interpolate));
}

function onSegment(p, [sa, sb]) {
  //checks if p is on segment
  let e = -0.0000001; //floating fudge
  // lol
  let inX =
    (sa[0] <= p[0] - e && p[0] + e <= sb[0]) ||
    (sa[0] >= p[0] + e && p[0] - e >= sb[0]);
  let inY =
    (sa[1] <= p[1] - e && p[1] + e <= sb[1]) ||
    (sa[1] >= p[1] + e && p[1] - e >= sb[1]);

  return inX && inY;
}

function intersects([a1, a2], [b1, b2]) {
  //given two segments, check if they intersect
  let sa = slope(a1, a2);
  let sb = slope(b1, b2);
  if (sa === sb) {
    return false;
  }
  let oa = offset(a1, a2);
  let ob = offset(b1, b2);

  let iX = (ob - oa) / (sa - sb);

  if (isNaN(iX)) {
    //special case vertical lines
    iX = sa === Infinity || sa === -Infinity ? a1[0] : b1[0];
  }

  let iY = findY(iX, sa, oa);
  if (onSegment([iX, iY], [a1, a2]) && onSegment([iX, iY], [b1, b2])) {
    return [iX, iY];
  } else {
    return false;
  }
}

function angle(o, p) {
  let [x, y] = sub(p, o);
  return Math.atan2(y, x); //o / a
}

function polarSort(o, points) {
  //sort list of points by their angle relative to o
  let isort = points.sort((a, b) => angle(o, a) - angle(o, b));
  return isort;
}

function extendPoint(gp, fp) {
  //extend point out into the distance in the direction of fp
  let n = normalize(sub(fp, gp));
  let sn = multiply(n, 500);

  return add(fp, sn);
}

function canSee(gp, wallPoints, target) {
  //given a list of walls, sees if gp can draw a line to target
  let walls = partition(wallPoints);

  let seg = [gp, target];
  let blocks = walls
    .filter(
      //incorrect use of onSegment assumptions here, causes edge case false positives :/
      //needs to check if target is really colinear
      ([a, b]) => a !== target && b !== target && !onSegment(target, [a, b])
    )
    .map(wallSeg => intersects(seg, wallSeg))
    .filter(a => a);

  return blocks.length === 0;
}

function visibleSet(gp, wallPoints) {
  //set of points that define the visible bounding polygon of a guard, constrained by walls.
  let walls = partition(wallPoints);

  //first find which existing wall points are visible
  let visibleWallPoints = wallPoints.map(p => {
    let seg = [gp, p];
    let blocks = walls
      .map(wallSeg => intersects(seg, wallSeg))
      .filter(a => a)
      .sort((a, b) => distance(a, gp) - distance(b, gp)) //find and take only closest to guard
      .slice(0, 1);

    // only keep points that are "official" wall points in this step
    return blocks.filter(a => wallPoints.findIndex(wp => eq(wp, a)) !== -1);
  });

  //sort for the next step
  visibleWallPoints = polarSort(gp, flatten(visibleWallPoints));

  //this code is tricky because it's looking for points that are on the sight polygon via projection
  //and maintain metadata to allow them to be annotated for correct ordering afterwards
  let visibles = visibleWallPoints.map(p => {
    //find the point that is the result of a ray being extended past each wall points we can see
    let ext = extendPoint(gp, p);

    let s1 = [gp, ext]; //s1 is the segments that will be checked for intersection with each wall segment

    let blocks = walls
      .map(wallSeg => {
        let i = intersects(s1, wallSeg);
        if (!i || distance(i, wallSeg[0]) < e || distance(i, wallSeg[1]) < e) {
          return false;
        }
        //pass through the wall segment to enable sortingIndex to be calculated afterwards
        return [i, wallSeg]; 
      })
      .filter((a, _) => a)
      .sort(([a, _], [b, __]) => distance(a, gp) - distance(b, gp));

    if (blocks.length > 1) {
      blocks = []; //removes extensions through walls
    }

    //find the index from the original polygon
    p.sortingIndex = wallPoints.findIndex(wp => eq(wp, p));

    if (blocks.length === 0) {
      //if there's no projected point, keep this one and continue;
      return [p];
    }

    let nP = blocks[0][0]; //nP is the point created by projection
    
    //this is the code needed to calculate its sorting index, which is based on that of the surface it's projected onto.
    let blockSegment = blocks[0][1];
    
    let segIndexA = wallPoints.findIndex(wp => eq(wp, blockSegment[0]));
    let segIndexB = wallPoints.findIndex(wp => eq(wp, blockSegment[1]));

    let dsA = distance(blockSegment[0], nP);
    let dsB = distance(blockSegment[1], nP);

    let tot = distance(blockSegment[0], blockSegment[1]);

    //for correct wrapping at the "N -> 0" index boundary:
    if (segIndexB < segIndexA) segIndexB += wallPoints.length;

    let segIndex = (segIndexA * dsB + segIndexB * dsA) / tot;
    
    //record where this point belongs in the original polygon
    nP.sortingIndex = segIndex;

    return [p, nP];
  });

  //sort the verts by their sorting index annotations for correct polygon output
  let sortedVisibles = flatten(visibles).sort(
    (a, b) => a.sortingIndex - b.sortingIndex
  );

  return sortedVisibles;
}

export { canSee, flatten, visibleSet, resample };

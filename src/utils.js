let e = 0.00000000001; //espilon
function last(l) {
  return l[l.length - 1];
}

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
  return wallPoints.map((p, i, a) => [p, a[(i + 1) % a.length]]);
}

function slope([ax, ay], [bx, by]) {
  return (ay - by) / (ax - bx);
}

function offset([ax, ay], [bx, by]) {
  let s = slope([ax, ay], [bx, by]);
  return ay - s * ax;
}

function findY(x, s, o) {
  return x * s + o;
}

function onSegment(p, [sa, sb]) {
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

function partitionByA(o, points) {
  let partitioned = [[]];
  let l = last(points);
  let prevA = 1234; //angle(o, last);

  for (var i = 0; i < points.length; i++) {
    let p = points[i];
    let a = angle(o, p);
    let pA = prevA;
    prevA = a;

    if (Math.abs(a - pA) < e) {
      partitioned[partitioned.length - 1].push(p);
    } else {
      partitioned.push([p]);
    }
  }
  let first = points[0];
  if (Math.abs(angle(o, first) - angle(o, l)) < e) {
    partitioned[0] = partitioned[0].concat(partitioned.pop());
  }
  return partitioned;
}

function polarSort(o, points) {
  let isort = points.sort((a, b) => angle(o, a) - angle(o, b));
  return isort;
  let pba = partitionByA(o, isort);

  let pbd = pba.filter(part => part.length > 0).map((sibs, i, a) => {
    let l = a.length;
    let prev = last(a[(i - 1 + l) % l]);
    if (sibs.length < 2) return sibs;
    return sibs.sort((a, b) => distance(prev, a) - distance(prev, b));
  });

  let fpba = flatten(pbd);

  return fpba;
}

function extendPoint(gp, fp) {
  let n = normalize(sub(fp, gp));
  let sn = multiply(n, 400);

  return add(fp, sn);
}

function visibleSet(gp, wallPoints) {
  let walls = partition(wallPoints);
  let directVisibles = polarSort(
    gp,
    flatten(
      wallPoints.map(p => {
        let s1 = [gp, p];
        let blocks = walls
          .map(s2 => intersects(s1, s2))
          .filter(a => a)
          .sort((a, b) => distance(a, gp) - distance(b, gp))
          .slice(0, 1);

        return blocks.filter(a => wallPoints.findIndex(wp => eq(wp, a)) !== -1);
        // return blocks;
      })
    )
  ).map(p => {
    let ext = extendPoint(gp, p);
    let s1 = [gp, ext];
    let blocks = walls
      .map(s2 => {
        let i = intersects(s1, s2);
        if (!i || distance(i, s2[0]) < e || distance(i, s2[1]) < e) {
          return false;
        }
        return [i, s2];
      })
      .filter((a, _) => a)
      .sort(([a, _], [b, __]) => distance(a, gp) - distance(b, gp))
      .slice(0, 1);

    p.sortingIndex = wallPoints.findIndex(wp => eq(wp, p));

    if (blocks.length < 1) {
      return [p];
    }
    let nP = blocks[0][0];
    let blockSegment = blocks[0][1];
    let segIndexA = wallPoints.findIndex(wp => eq(wp, blockSegment[0]));
    let segIndexB = wallPoints.findIndex(wp => eq(wp, blockSegment[1]));
    if(segIndexB < segIndexA)
      segIndexB+=wallPoints.length*2

    let segIndex = (segIndexA + segIndexB) /2 
    // console.log(p.sortingIndex, segIndex, segIndexA, segIndexB)
    nP.sortingIndex = (p.sortingIndex + segIndex) / 2;
    return [p, nP];
  });

  let sortedVisibles = flatten(directVisibles).sort(
    (a, b) => a.sortingIndex - b.sortingIndex
  );

  return sortedVisibles
}

function canSee(gp, wallPoints, target) {
  let walls = partition(wallPoints);
  let s1 = [gp, target];
  let blocks = walls
    .filter(([a, b]) => a !== target && b !== target)
    .map(s2 => intersects(s1, s2))
    .filter(a => a);

  return blocks.length === 0;
}

export { canSee, flatten, visibleSet };

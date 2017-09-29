function flatten(array){
  return [].concat(...array);
}

console.log(flatten([[1,2,3],[4,5,6]]))

function partition(wallPoints){
  return wallPoints.map((p,i,a)=>[p, a[ (i + 1) % a.length]])
}

function slope([ax,ay], [bx,by]){
  return (ay - by ) / (ax - bx) 
}

function offset([ax,ay], [bx,by]){
  let s = slope([ax,ay],[bx,by])
  return  ay - s * ax 
}

function findY(x, s, o){
  return x*s + o
}

function onSegment(p, [sa, sb]){
  let f = -0.0000001;//floating fudge
  // lol
  let inX = (sa[0] <= p[0]-f &&  p[0]+f <= sb[0]) || 
             (sa[0] >= p[0]+f && p[0]-f >= sb[0])
  let inY = (sa[1] <= p[1]-f && p[1]+f <= sb[1]) ||
             (sa[1] >= p[1]+f && p[1]-f >= sb[1])
  return inX && inY
}

function intersects([a1,a2], [b1,b2]){
  let sa = slope(a1, a2)
  let sb = slope(b1, b2)
  if(sa === sb) { return false; }
  let oa = offset(a1, a2)
  let ob = offset(b1, b2)
  
  let iX = (ob-oa) / (sa-sb);
  
  if(isNaN(iX)){
    iX = (sa === Infinity || sa === -Infinity) ? a1[0] : b1[0] 
  }

  let iY = findY(iX, sa, oa)
  if (onSegment([iX,iY], [a1,a2]) && onSegment([iX,iY], [b1,b2])){
    return [iX,iY]
  }else{
    return false
  }
}
function distance([ax,ay],[bx,by]){
  let s = [ax-bx, ay-by]
  return Math.sqrt(Math.pow(s[0],2) + Math.pow(s[1],2))
}

function visibleSet(gp, wallPoints){
  let walls = partition(wallPoints);
  return flatten(wallPoints.map(p => {
    let s1 = [gp, p]
    let blocks = walls.map(s2 => intersects(s1,s2))
                    .filter(a=>a)
                    .sort((a,b)=>distance(a, gp)-distance(b, gp)).slice(0,1)
    return blocks
  }))
}
function extendPoint(gp,fp, wallPoints){
  wallPoints.map(wp=>{
    
  })
}

function canSee(gp, wallPoints, target){
  let walls = partition(wallPoints);
  let s1 = [gp,target]
  let blocks = walls.filter(([a,b]) => a!== target && b!==target).map(s2 => intersects(s1,s2)).filter(a=>a);

  return blocks.length===0
}

export {canSee, flatten, visibleSet}
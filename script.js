/* HERO */
const heroTop=document.querySelector('.hero-top');
const heroBottom=document.querySelector('.hero-bottom');
new IntersectionObserver(entries=>{
 entries.forEach(e=>{if(e.isIntersecting){heroTop.classList.add('show');heroBottom.classList.add('show');}});
},{threshold:0.3}).observe(document.querySelector('.hero-content'));

/* SEE MORE */
const cardObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('show');
    }
  });
},{threshold:0.18});
document.querySelectorAll('.card').forEach(card=> cardObserver.observe(card));

/* -----------------------------
   See more / Collapse (fix lỗi)
   - initially show first 4 cards
   - expand: reveal rest with small stagger + mark expanded
   - collapse: hide cards 4..end again and remove .show
   -----------------------------*/
const seeBtn = document.getElementById('seeMoreBtn');
const cardsAll = Array.from(document.querySelectorAll('.card'));
const initiallyVisible = 4;
let expanded = false;

function expandCards(){
  const hiddenCards = cardsAll.slice(initiallyVisible);
  hiddenCards.forEach((card, i)=>{
    // remove hidden and then show with stagger
    card.classList.remove('hidden');
    // ensure hidden is removed from layout before animating:
    setTimeout(()=> {
      card.style.display = ''; // allow CSS/grid to place it
      setTimeout(()=> card.classList.add('show'), i * 120);
    }, 20);
  });
  seeBtn.textContent = 'Thu gọn lại';
  expanded = true;
}

function collapseCards(){
  const hiddenCards = cardsAll.slice(initiallyVisible);
  hiddenCards.forEach(card=>{
    // remove visible animation then hide
    card.classList.remove('show');
    // after animation duration, hide it
    setTimeout(()=>{
      card.classList.add('hidden');
      card.style.display = 'none';
    }, 300);
  });
  // scroll up to collection start so user sees the collapsed state
  setTimeout(()=>{
    window.scrollTo({top: document.querySelector('.collection-section').offsetTop - 80, behavior:'smooth'});
  }, 310);
  seeBtn.textContent = 'Xem thêm';
  expanded = false;
}

seeBtn.addEventListener('click', ()=>{
  if(!expanded) expandCards();
  else collapseCards();
});

/* SIDEBAR */
document.getElementById('menuToggle').addEventListener('click',()=>sidebar.classList.add('active'));
document.getElementById('closeSidebar').addEventListener('click',()=>sidebar.classList.remove('active'));

/* FILTER */
const brandFilter = document.getElementById('brandFilter');
const typeFilter  = document.getElementById('typeFilter');
const priceFilter = document.getElementById('priceFilter');

function filterCars(){
  const brand = brandFilter.value;
  const type = typeFilter.value;
  const price = priceFilter.value;

  cardsAll.forEach((card, idx)=>{
    const matchBrand = (brand === 'all' || card.dataset.brand === brand);
    const matchType  = (type  === 'all' || card.dataset.type  === type);
    let matchPrice = false;
    if(price === 'all') matchPrice = true;
    else if(price === 'low'  && card.dataset.price === 'low')  matchPrice = true;
    else if(price === 'mid'  && card.dataset.price === 'mid')  matchPrice = true;
    else if(price === 'high' && card.dataset.price === 'high') matchPrice = true;

    const shouldShow = matchBrand && matchType && matchPrice;

    // if card belongs to hidden group and not expanded -> keep hidden
    if(idx >= initiallyVisible && !expanded){
      // always hide collapsed cards
      card.style.display = 'none';
    } else {
      // not in collapsed group or expanded -> respect filter
      card.style.display = shouldShow ? '' : 'none';
      if(shouldShow && !card.classList.contains('show')){
        // if it's visible and not animated-in yet, add .show (slight delay for nicer effect)
        setTimeout(()=> card.classList.add('show'), 60);
      }
      if(!shouldShow){
        card.classList.remove('show');
      }
    }
  });
}

brandFilter.addEventListener('change', filterCars);
typeFilter.addEventListener('change', filterCars);
priceFilter.addEventListener('change', filterCars);
document.addEventListener("DOMContentLoaded", () => {
    const imgs = document.querySelectorAll(".blog-images img");
    imgs.forEach((img, i) => {
      setTimeout(() => {
        img.classList.add("show");
      }, i * 400); // mỗi ảnh xuất hiện cách nhau 0.4s
    });
  });

/* ensure initial collapsed cards have style.display = 'none' (defensive) */
cardsAll.slice(initiallyVisible).forEach(card => card.style.display = 'none');
const items = document.querySelectorAll('.accordion-item');

    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(el => {
          if(el !== item){
            el.classList.remove('active');
          }
        });
        item.classList.toggle('active');
      });
    });

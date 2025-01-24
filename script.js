document.addEventListener('DOMContentLoaded', () => {
    let productData = [];
    let allFilteredProducts = [];
    let displayedProducts = [];
    let currentPage = 1;
    let cart = [];
  
    // DOM Elements
    const searchBar = document.getElementById('search-bar');
    const suggestionsList = document.getElementById('suggestions');
    const searchContainer = document.querySelector('.search-container');
  
    // Filter dropdowns
    const filterPriceRange = document.getElementById('filter-price-range');
    const filterCategory = document.getElementById('filter-category');
    const filterSortPrice = document.getElementById('filter-sort-price');
    const filterAvailability = document.getElementById('filter-availability');
  
    // Product container & pagination
    const productsContainer = document.getElementById('products-container');
    const paginationContainer = document.getElementById('pagination');
  
    // Cart container -in cart modal
    const cartContainer = document.getElementById('cart-container');
  
    // Cart count displays (desktop & mobile)
    const cartCountSpan = document.getElementById('cart-count');
    const cartCountSpanMobile = document.getElementById('cart-count-mobile');
  
    // Cart modal
    const cartModal = document.getElementById('cart-modal');
    const cartModalCloseBtn = document.getElementById('cart-modal-close-btn');
  
    // Links for opening cart 
    const cartLink = document.getElementById('cart-link');
    const cartLinkMobile = document.getElementById('cart-link-mobile');
  
    // Product Modal Elements
    const modal = document.getElementById('product-modal');
    const modalBackBtn = document.getElementById('modal-back-btn');
    const modalProductImage = document.getElementById('modal-product-image');
    const modalProductName = document.getElementById('modal-product-name');
    const modalProductDescription = document.getElementById('modal-product-description');
    const modalProductPrice = document.getElementById('modal-product-price');
    const modalProductAvailability = document.getElementById('modal-product-availability');
    const modalProductCategory = document.getElementById('modal-product-category');
    const modalAddCartBtn = document.getElementById('modal-add-cart-btn');
    const modalBuyBtn = document.getElementById('modal-buy-btn');
  
    // Pagination Detection
    function getDeviceType() {
      const width = window.innerWidth;
      if (width >= 1024) return 'desktop';
      if (width >= 768) return 'tablet';
      return 'mobile';
    }
  
    function getMaxProductsPerPage() {
      return getDeviceType() === 'desktop' ? 8 : 6;
    }
  
    // Fetching Json
    fetch('product.json')
      .then(response => response.json())
      .then(data => {
        if (data && data.products) {
          productData = data.products;
          // Populate category dropdown
          populateCategoryDropdown(productData);
          // Apply filters
          applyAllFilters();
          // Render cart
          renderCart();
        } else {
          console.error('Invalid product data structure.');
        }
      })
      .catch(error => console.error('Error fetching product data:', error));
  
    // SearchBar AutoSuggession
    searchBar.addEventListener('input', () => {
      const query = searchBar.value.trim().toLowerCase();
      suggestionsList.innerHTML = '';
  
      if (!query) {
        suggestionsList.style.display = 'none';
        applyAllFilters();
        return;
      }
  
      const filtered = productData.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
      );
  
      filtered.forEach(product => {
        const listItem = document.createElement('li');
        listItem.textContent = `${product.name} (${product.category})`;
        suggestionsList.appendChild(listItem);
  
        listItem.addEventListener('click', () => {
          searchBar.value = product.name;
          suggestionsList.innerHTML = '';
          suggestionsList.style.display = 'none';
          applyAllFilters();
        });
      });
  
      suggestionsList.style.display = filtered.length ? 'block' : 'none';
    });
  
    // Hide suggestions if clicking outside
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target)) {
        suggestionsList.innerHTML = '';
        suggestionsList.style.display = 'none';
      }
    });
  
    // Filter & Sort Logic
    filterPriceRange.addEventListener('change', applyAllFilters);
    filterCategory.addEventListener('change', applyAllFilters);
    filterSortPrice.addEventListener('change', applyAllFilters);
    filterAvailability.addEventListener('change', applyAllFilters);
  
    function applyAllFilters() {
      currentPage = 1; 
      let filtered = productData.slice();
  
      // Search
      const query = searchBar.value.trim().toLowerCase();
      if (query) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }
      // Price
      switch (filterPriceRange.value) {
        case 'below500':
          filtered = filtered.filter(p => p.price < 500);
          break;
        case '500-2000':
          filtered = filtered.filter(p => p.price >= 500 && p.price <= 2000);
          break;
        case 'above2000':
          filtered = filtered.filter(p => p.price > 2000);
          break;
        default:
          break;
      }
      // Category
      if (filterCategory.value !== 'all') {
        filtered = filtered.filter(p => p.category === filterCategory.value);
      }
      // Availability
      if (filterAvailability.value === 'in') {
        filtered = filtered.filter(p => p.availability === true);
      } else if (filterAvailability.value === 'out') {
        filtered = filtered.filter(p => p.availability === false);
      }
      // Sort
      if (filterSortPrice.value === 'asc') {
        filtered.sort((a, b) => a.price - b.price);
      } else if (filterSortPrice.value === 'desc') {
        filtered.sort((a, b) => b.price - a.price);
      }
  
      allFilteredProducts = filtered;
      updatePagination();
    }
  
    function updatePagination() {
      const maxProducts = getMaxProductsPerPage();
      const totalProducts = allFilteredProducts.length;
      const totalPages = Math.ceil(totalProducts / maxProducts) || 1;
  
      if (currentPage > totalPages) currentPage = totalPages;
      if (currentPage < 1) currentPage = 1;
  
      const startIndex = (currentPage - 1) * maxProducts;
      const endIndex = startIndex + maxProducts;
      displayedProducts = allFilteredProducts.slice(startIndex, endIndex);
  
      renderProducts(displayedProducts);
      renderPaginationControls(totalPages, currentPage);
    }
  
    function renderPaginationControls(totalPages, current) {
      paginationContainer.innerHTML = '';
      if (totalPages <= 1) return;
  
      const prevBtn = document.createElement('button');
      prevBtn.textContent = 'Prev';
      prevBtn.disabled = (current === 1);
      prevBtn.addEventListener('click', () => {
        currentPage--;
        updatePagination();
      });
      paginationContainer.appendChild(prevBtn);
  
      for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        if (i === current) pageBtn.classList.add('active');
        pageBtn.addEventListener('click', () => {
          currentPage = i;
          updatePagination();
        });
        paginationContainer.appendChild(pageBtn);
      }
  
      const nextBtn = document.createElement('button');
      nextBtn.textContent = 'Next';
      nextBtn.disabled = (current === totalPages);
      nextBtn.addEventListener('click', () => {
        currentPage++;
        updatePagination();
      });
      paginationContainer.appendChild(nextBtn);
    }
  
    // Render Products
    function renderProducts(productsArray) {
      productsContainer.innerHTML = '';
  
      if (!productsArray.length) {
        productsContainer.innerHTML = '<p>No products found.</p>';
        return;
      }
  
      productsArray.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
  
        const cardInner = document.createElement('div');
        cardInner.className = 'product-card-inner';
  
        const img = document.createElement('img');
        img.src = product.image;
        img.alt = product.name;
  
        const nameEl = document.createElement('div');
        nameEl.className = 'product-name';
        nameEl.textContent = product.name;
  
        const descEl = document.createElement('div');
        descEl.className = 'product-description';
        descEl.textContent = product.description;
  
        const priceEl = document.createElement('div');
        priceEl.className = 'product-price';
        priceEl.textContent = 'Price: ₹' + product.price;
  
        const btnContainer = document.createElement('div');
        btnContainer.className = 'product-buttons';
  
        // View Product using modal
        const viewBtn = document.createElement('button');
        viewBtn.className = 'view-btn';
        viewBtn.textContent = 'View Product';
        viewBtn.addEventListener('click', () => {
          showProductModal(product);
        });
  
        // Add to Cart
        const cartBtn = document.createElement('button');
        cartBtn.className = 'cart-btn';
        cartBtn.textContent = 'Add to Cart';
        cartBtn.addEventListener('click', () => {
          if (cart.some(item => item.id === product.id)) {
            alert('Item is already in the cart.');
          } else {
            cart.push(product);
            alert('Item added to cart.');
            updateCartCount();
            renderCart();
          }
        });
  
        btnContainer.appendChild(viewBtn);
        btnContainer.appendChild(cartBtn);
  
        cardInner.appendChild(img);
        cardInner.appendChild(nameEl);
        cardInner.appendChild(descEl);
        cardInner.appendChild(priceEl);
        cardInner.appendChild(btnContainer);
  
        card.appendChild(cardInner);
        productsContainer.appendChild(card);
      });
    }
  
    // Category Dropdown
    function populateCategoryDropdown(products) {
      const categories = new Set(products.map(p => p.category));
      const sorted = Array.from(categories).sort();
      filterCategory.innerHTML = '<option value="all">All</option>';
  
      sorted.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        filterCategory.appendChild(opt);
      });
    }
  
    // Hamburger Menu (Mobile/Tablet)
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const mobileMenu = document.getElementById('mobile-menu');
  
    function handleHamburgerVisibility() {
      if (window.innerWidth <= 1023) {
        hamburgerMenu.style.display = 'flex';
      } else {
        hamburgerMenu.style.display = 'none';
        mobileMenu.classList.remove('open');
        document.body.classList.remove('no-scroll');
      }
    }
    window.addEventListener('resize', () => {
      handleHamburgerVisibility();
      updatePagination();
    });
    handleHamburgerVisibility();
  
    hamburgerMenu.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      hamburgerMenu.classList.toggle('open');  
      hamburgerMenu.setAttribute('aria-expanded', mobileMenu.classList.contains('open'));
  
      if (mobileMenu.classList.contains('open')) {
        document.body.classList.add('no-scroll');
      } else {
        document.body.classList.remove('no-scroll');
      }
    });
  
    // Close mobile menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburgerMenu.classList.remove('open'); 
        hamburgerMenu.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('no-scroll');
      });
    });
  
    // click outside to close
    window.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !hamburgerMenu.contains(e.target)) {
        if (mobileMenu.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          hamburgerMenu.classList.remove('open');
          hamburgerMenu.setAttribute('aria-expanded', 'false');
          document.body.classList.remove('no-scroll');
        }
      }
    });
  
    // Product Modal Logic
    function showProductModal(product) {
      if (!modal || !modalProductName || !modalProductDescription ||
          !modalProductPrice || !modalProductAvailability || 
          !modalProductCategory || !modalAddCartBtn || !modalBuyBtn) {
        console.error('One or more modal elements are missing.');
        return;
      }
  
      // Close cart modal if open
      cartModal.style.display = 'none';
  
      if (!product) {
        console.error('No product passed to showProductModal');
        return;
      }
  
      modalProductImage.src = product.image || 'images/default-product.png';
      modalProductImage.alt = product.name || 'Product Image';
      modalProductName.textContent = product.name || 'Unnamed Product';
      modalProductDescription.textContent = product.description || 'No description available.';
      modalProductPrice.textContent = product.price ? `Price: ₹${product.price}` : 'Price: N/A';
      modalProductAvailability.textContent = product.availability
        ? 'Availability: In Stock'
        : 'Availability: Out of Stock';
      modalProductCategory.textContent = 'Category: ' + (product.category || 'Uncategorized');
  
      modalAddCartBtn.onclick = () => {
        if (cart.some(item => item.id === product.id)) {
          alert('Item is already in the cart.');
        } else {
          cart.push(product);
          alert('Item added to cart.');
          updateCartCount();
          renderCart();
        }
      };
      modalBuyBtn.onclick = () => {
        alert('Thanks for buying the product.');
      };
  
      // Display modal
      modal.style.display = 'flex';
    }
  
    modalBackBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  
    // Cart Modal Logic
    cartLink.addEventListener('click', (e) => {
      e.preventDefault();
      showCartModal();
    });
    cartLinkMobile.addEventListener('click', (e) => {
      e.preventDefault();
      showCartModal();
    });
  
    function showCartModal() {
      renderCart();
      cartModal.style.display = 'flex';
    }
  
    cartModalCloseBtn.addEventListener('click', () => {
      cartModal.style.display = 'none';
    });
    window.addEventListener('click', (event) => {
      if (event.target === cartModal) {
        cartModal.style.display = 'none';
      }
    });
  
    // Cart Logic
    function renderCart() {
      cartContainer.innerHTML = '';
      if (!cart.length) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
        return;
      }  
      cart.forEach((item, index) => {
        const cartCard = document.createElement('div');
        cartCard.className = 'cart-card';  
        const cartName = document.createElement('h3');
        cartName.textContent = item.name || 'Unnamed Product';  
        const cartDesc = document.createElement('div');
        cartDesc.className = 'cart-short-desc';
        cartDesc.textContent = item.description || 'No description available.';  
        const cartPrice = document.createElement('div');
        cartPrice.className = 'cart-price';
        cartPrice.textContent = item.price ? `Price: ₹${item.price}` : 'Price: N/A';  
        const cartButtons = document.createElement('div');
        cartButtons.className = 'cart-buttons';  
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
          cart.splice(index, 1);
          updateCartCount();
          renderCart();
        });
  
        const viewBtn = document.createElement('button');
        viewBtn.className = 'view-btn-cart';
        viewBtn.textContent = 'View Product';
        viewBtn.addEventListener('click', () => {
          cartModal.style.display = 'none';
          showProductModal(item);
        });
  
        cartButtons.appendChild(deleteBtn);
        cartButtons.appendChild(viewBtn);  
        cartCard.appendChild(cartName);
        cartCard.appendChild(cartDesc);
        cartCard.appendChild(cartPrice);
        cartCard.appendChild(cartButtons);  
        cartContainer.appendChild(cartCard);
      });
    }
  
    function updateCartCount() {
      cartCountSpan.textContent = cart.length;
      cartCountSpanMobile.textContent = cart.length;
    }
  });
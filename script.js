// Fetch the JSON data from the product.json file
fetch('product.json')
  .then(response => response.json())
  .then(productData => {
    const searchBar = document.getElementById('search-bar');
    const suggestionsList = document.getElementById('suggestions');

    // Event listener for input changes
    searchBar.addEventListener('input', () => {
      const query = searchBar.value.toLowerCase();
      suggestionsList.innerHTML = ''; // Clear previous suggestions

      // Filter the products based on the user's query
      const filteredProducts = productData.products.filter(product =>
        product.name.toLowerCase().includes(query)
      );

      // Display the filtered products as suggestions
      filteredProducts.forEach(product => {
        const listItem = document.createElement('li');
        listItem.textContent = product.name;
        suggestionsList.appendChild(listItem);
      });
    });
  })
  .catch(error => console.error('Error fetching product data:', error));

// Toggle hamburger menu visibility based on window size
const hamburgerMenu = document.querySelector('.hamburger-menu');
const mobileMenu = document.querySelector('.mobile-menu');

// Function to hide hamburger icon and mobile menu on laptops and larger screens
function handleHamburgerVisibility() {
  if (window.innerWidth <= 1023) {
    // Show hamburger menu on mobile/tablet
    hamburgerMenu.style.display = 'flex';
  } else {
    // Hide hamburger menu on laptop and larger screens
    hamburgerMenu.style.display = 'none';
    mobileMenu.classList.remove('open'); // Ensure the mobile menu is hidden
    hamburgerMenu.classList.remove('open'); // Remove open class to reset the menu
  }
}

// Initial check on page load
handleHamburgerVisibility();

// Event listener for window resizing to handle dynamic visibility
window.addEventListener('resize', handleHamburgerVisibility);

// Toggle mobile menu visibility when the hamburger is clicked
hamburgerMenu.addEventListener('click', () => {
  hamburgerMenu.classList.toggle('open');
  mobileMenu.classList.toggle('open');
});

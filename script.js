// API Keys
const spoonacularApiKey = config.spoonacularApiKey;
const googleApiKey = config.googleApiKey;
const googleSearchEngineId = config.googleSearchEngineId;

// Initialize ingredients array
let ingredients = [];

// Ingredient variations mapping
const ingredientVariations = {
    'chicken': ['chicken breast', 'chicken thigh', 'chicken wing', 'chicken drumstick', 'chicken leg', 'chicken meat', 'chicken pieces'],
    'beef': ['ground beef', 'beef steak', 'beef mince', 'steak', 'beef chuck', 'beef sirloin'],
    'pork': ['pork chop', 'pork loin', 'ground pork', 'pork belly', 'bacon'],
    'fish': ['salmon', 'tuna', 'cod', 'tilapia', 'fish fillet'],
    'cheese': ['cheddar', 'mozzarella', 'parmesan', 'feta cheese', 'cream cheese', 'cheese'],
    'pasta': ['spaghetti', 'penne', 'fettuccine', 'macaroni', 'noodles'],
    'tomato': ['tomatoes', 'cherry tomatoes', 'roma tomatoes', 'tomato sauce'],
    'potato': ['potatoes', 'sweet potato', 'potato wedges', 'mashed potato'],
    'carrot': ['carrots', 'baby carrots', 'shredded carrots'],
    'onion': ['yellow onion', 'red onion', 'white onion', 'green onion', 'scallion'],
    'feta': ['feta cheese', 'greek feta', 'feta'],
    'rice': ['white rice', 'brown rice', 'jasmine rice', 'basmati rice'],
    'beans': ['black beans', 'kidney beans', 'pinto beans', 'chickpeas', 'garbanzo beans'],
    'mushroom': ['mushrooms', 'button mushrooms', 'portobello mushrooms', 'shiitake mushrooms']
};

// Pantry items organized by category
const pantryItems = {
    'Seasonings & Spices': [
        'salt', 'black pepper', 'garlic powder', 'onion powder', 
        'paprika', 'dried oregano', 'dried basil', 'ground cumin'
    ],
    'Oils & Condiments': [
        'olive oil', 'vegetable oil', 'soy sauce', 'vinegar', 
        'worcestershire sauce', 'hot sauce', 'mayonnaise', 'mustard'
    ],
    'Baking Essentials': [
        'flour', 'sugar', 'baking powder', 'baking soda', 
        'vanilla extract', 'brown sugar', 'cornstarch'
    ],
    'Basic Ingredients': [
        'garlic', 'onion', 'butter', 'eggs', 'milk', 
        'cooking spray', 'water'
    ]
};

// Store selected pantry items
let selectedPantryItems = new Set(JSON.parse(localStorage.getItem('selectedPantryItems')) || []);

// Add event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('ingredientInput');
    if (input) {
        // Handle Enter key press
        input.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                addIngredient();
            }
        });

        // Handle button click
        const addButton = document.querySelector('.ingredient-input button');
        if (addButton) {
            addButton.addEventListener('click', addIngredient);
        }

        // Auto-focus the input
        input.focus();
    }

    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('pantryModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    }
});
// Pantry Management Functions
function togglePantryChecklist() {
    const modal = document.getElementById('pantryModal');
    if (modal.style.display === 'block') {
        modal.style.display = 'none';
    } else {
        modal.style.display = 'block';
        renderPantryChecklist();
    }
}

function renderPantryChecklist() {
    const container = document.getElementById('pantryChecklist');
    container.innerHTML = '';

    Object.entries(pantryItems).forEach(([category, items]) => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'pantry-category';
        categoryDiv.innerHTML = `<h3>${category}</h3>`;
        
        items.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'pantry-item';
            itemDiv.innerHTML = `
                <input type="checkbox" id="${item}" 
                    ${selectedPantryItems.has(item) ? 'checked' : ''}>
                <label for="${item}">${item}</label>
            `;
            categoryDiv.appendChild(itemDiv);
        });
        
        container.appendChild(categoryDiv);
    });
}

function savePantrySelections() {
    selectedPantryItems.clear();
    const checkboxes = document.querySelectorAll('#pantryChecklist input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedPantryItems.add(checkbox.id);
        }
    });
    
    localStorage.setItem('selectedPantryItems', JSON.stringify([...selectedPantryItems]));
    togglePantryChecklist();
}

// Ingredient Management Functions
function addIngredient() {
    const input = document.getElementById('ingredientInput');
    const ingredient = input.value.trim().toLowerCase();
    
    // Check if input is empty
    if (!ingredient) {
        return;
    }

    // Check if ingredient is already in the list
    if (ingredients.includes(ingredient)) {
        alert('This ingredient is already in your list!');
        input.value = '';
        input.focus();
        return;
    }

    // Check if ingredient is in pantry
    if (selectedPantryItems.has(ingredient)) {
        alert('This item is already in your pantry!');
        input.value = '';
        input.focus();
        return;
    }

    // Add the ingredient
    ingredients.push(ingredient);
    updateIngredientList();
    
    // Clear and focus the input
    input.value = '';
    input.focus();

    console.log('Current ingredients:', ingredients); // Debug log
}

function removeIngredient(ingredient) {
    ingredients = ingredients.filter(item => item !== ingredient);
    updateIngredientList();
    console.log('Ingredient removed:', ingredient); // Debug log
    console.log('Current ingredients:', ingredients); // Debug log
}

function updateIngredientList() {
    const list = document.getElementById('ingredientList');
    if (!list) return;
    
    list.innerHTML = '';
    
    ingredients.forEach(ingredient => {
        const div = document.createElement('div');
        div.className = 'ingredient-item';
        div.innerHTML = `
            ${ingredient}
            <button onclick="removeIngredient('${ingredient}')">Remove</button>
        `;
        list.appendChild(div);
    });
}

// Recipe Search Functions
function searchRecipes() {
    if (ingredients.length < 1) {
        alert('Please enter at least 1 ingredient to search for recipes.');
        return;
    }
    sessionStorage.setItem('ingredients', JSON.stringify(ingredients));
    window.location.href = 'results.html';
}

// Results page initialization
if (window.location.pathname.includes('results.html')) {
    window.onload = function() {
        const storedIngredients = JSON.parse(sessionStorage.getItem('ingredients') || '[]');
        fetchRecipes(storedIngredients);
    };
}
// Main Recipe Fetching Functions
async function fetchRecipes(ingredients) {
    const resultsDiv = document.getElementById('recipeResults');
    
    if (ingredients.length < 1) {
        resultsDiv.innerHTML = '<p>Please enter at least 1 ingredient to search for recipes.</p>';
        return;
    }

    try {
        resultsDiv.innerHTML = '<p class="loading">Searching for recipes from multiple sources...</p>';
        
        // Fetch from both APIs in parallel
        const [spoonacularRecipes, googleRecipes] = await Promise.all([
            fetchFromSpoonacular(ingredients),
            fetchFromGoogle(ingredients)
        ]);

        // Debug log
        debugApiResponses(spoonacularRecipes, googleRecipes);

        // Combine and process all recipes
        const allRecipes = [...spoonacularRecipes, ...googleRecipes]
            .map(recipe => processRecipe(recipe, ingredients))
            .sort((a, b) => {
                // Sort by match percentage first
                if (b.matchPercentage !== a.matchPercentage) {
                    return b.matchPercentage - a.matchPercentage;
                }
                // Then by missing ingredients count
                return a.missedIngredients.length - b.missedIngredients.length;
            });

        // Display results
        if (allRecipes.length === 0) {
            resultsDiv.innerHTML = `
                <p>No recipes found that use your ingredients. Try different ingredients!</p>
                <p class="pantry-note">Your pantry items are automatically included in the search.</p>
            `;
        } else {
            resultsDiv.innerHTML = `
                <div class="pantry-note">Showing recipes from multiple sources, sorted by best match</div>
                <h2>Found ${allRecipes.length} recipes using your ingredients:</h2>
                <div class="recipe-grid">
                    ${allRecipes.map(recipe => createRecipeCard(recipe)).join('')}
                </div>
            `;
        }
    } catch (error) {
        resultsDiv.innerHTML = '<p>Error finding recipes. Please try again.</p>';
        console.error('Error:', error);
    }
}

// Spoonacular API Integration
async function fetchFromSpoonacular(ingredients) {
    // Expand ingredients to include variations
    const expandedIngredients = ingredients.flatMap(expandIngredientSearch);
    const ingredientsList = expandedIngredients.join(',+');
    
    try {
        const response = await fetch(
            `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${spoonacularApiKey}&ingredients=${ingredientsList}&number=25&ranking=2&ignorePantry=true`
        );
        
        if (!response.ok) {
            throw new Error(`Spoonacular API error! status: ${response.status}`);
        }
        
        const recipes = await response.json();
        return recipes.map(recipe => ({
            ...recipe,
            source: 'spoonacular',
            sourceUrl: `https://spoonacular.com/recipes/${recipe.title.toLowerCase().replace(/\s+/g, '-')}-${recipe.id}`
        }));
    } catch (error) {
        console.error('Spoonacular API error:', error);
        return [];
    }
}

// Google Custom Search API Integration
async function fetchFromGoogle(ingredients) {
    // Expand ingredients to include variations
    const expandedIngredients = ingredients.flatMap(expandIngredientSearch);
    const searchQuery = `recipe (${expandedIngredients.join(' OR ')}) -site:pinterest.*`;
    
    console.log('Searching Google with query:', searchQuery); // Debug log

    try {
        const url = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${googleSearchEngineId}&q=${encodeURIComponent(searchQuery)}&num=10`;
        
        console.log('Fetching from URL:', url); // Debug log
        
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Google API Error Response:', errorData);
            throw new Error(`Google API error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Google API Response:', data);

        if (!data.items) {
            console.log('No items found in Google response');
            return [];
        }

        return data.items.map(item => ({
            id: item.cacheId || Math.random().toString(36).substr(2, 9),
            title: item.title
                .replace(/ recipe\b/i, '')
                .replace(/ \| .+$/, '')
                .replace(/\s*-\s*.+$/, ''),
            image: item.pagemap?.cse_image?.[0]?.src || 
                   item.pagemap?.recipe?.[0]?.image ||
                   'https://via.placeholder.com/300x200?text=No+Image',
            sourceUrl: item.link,
            source: 'google',
            snippet: item.snippet,
            usedIngredients: [],  // Will be populated in processRecipe
            missedIngredients: [], // Will be populated in processRecipe
            hostname: new URL(item.link).hostname.replace('www.', '')
        }));
    } catch (error) {
        console.error('Google API error:', error);
        return [];
    }
}
// Recipe Processing Functions
function processRecipe(recipe, userIngredients) {
    const isSpoonacular = recipe.source === 'spoonacular';
    
    // Expand user ingredients to include variations
    const expandedIngredients = userIngredients.reduce((acc, ing) => {
        if (ingredientVariations[ing]) {
            acc.push(...ingredientVariations[ing]);
        }
        acc.push(ing);
        return acc;
    }, []);

    // Get pantry ingredients that might be used
    const usedPantryItems = Array.from(selectedPantryItems).filter(item => 
        recipe.title.toLowerCase().includes(item) || 
        (recipe.snippet && recipe.snippet.toLowerCase().includes(item))
    );
    
    if (isSpoonacular) {
        // Calculate match percentage for Spoonacular recipes
        const totalIngredients = recipe.usedIngredients.length + recipe.missedIngredients.length;
        const usedCount = recipe.usedIngredients.filter(
            ing => expandedIngredients.some(userIng => 
                ing.name.toLowerCase().includes(userIng.toLowerCase())
            ) || 
            selectedPantryItems.has(ing.name.toLowerCase())
        ).length;
        
        return {
            ...recipe,
            matchPercentage: Math.round((usedCount / totalIngredients) * 100),
            pantryItemsUsed: usedPantryItems
        };
    } else {
        // Process Google search results
        const snippet = recipe.snippet.toLowerCase();
        const title = recipe.title.toLowerCase();
        const fullText = `${snippet} ${title}`;
        
        // Find matched ingredients including variations
        const matchedIngredients = new Set();
        expandedIngredients.forEach(ing => {
            if (fullText.includes(ing.toLowerCase())) {
                // Add the base ingredient name
                const baseIngredient = userIngredients.find(base => 
                    ing === base || (ingredientVariations[base] && ingredientVariations[base].includes(ing))
                );
                matchedIngredients.add(baseIngredient || ing);
            }
        });

        // Extract additional ingredients using improved detection
        const additionalIngredients = extractAdditionalIngredients(fullText);
        
        return {
            ...recipe,
            matchPercentage: calculateGoogleMatchPercentage(matchedIngredients.size + usedPantryItems.length),
            usedIngredients: Array.from(matchedIngredients).map(ing => ({ name: ing })),
            missedIngredients: additionalIngredients.map(ing => ({ name: ing })),
            pantryItemsUsed: usedPantryItems
        };
    }
}

function extractAdditionalIngredients(text) {
    // Common cooking ingredients and their variations
    const ingredientPatterns = {
        // Proteins
        'chicken': /chicken\s*\w*/g,
        'beef': /beef\s*\w*/g,
        'pork': /pork\s*\w*/g,
        'fish': /fish|salmon|tuna|cod|tilapia/g,
        
        // Dairy
        'cheese': /cheese\s*\w*/g,
        'milk': /milk|cream/g,
        'butter': /butter/g,
        'egg': /eggs?/g,
        
        // Vegetables
        'onion': /onions?/g,
        'garlic': /garlic/g,
        'tomato': /tomatoes?/g,
        'carrot': /carrots?/g,
        'celery': /celery/g,
        'pepper': /peppers?/g,
        
        // Pantry
        'flour': /flour/g,
        'sugar': /sugar/g,
        'oil': /oil/g,
        'vinegar': /vinegar/g,
        'sauce': /sauce/g,
        'broth': /broth|stock/g,
        
        // Herbs & Spices
        'salt': /salt/g,
        'pepper': /pepper/g,
        'oregano': /oregano/g,
        'basil': /basil/g,
        'thyme': /thyme/g,
        
        // Grains & Starches
        'rice': /rice/g,
        'pasta': /pasta|spaghetti|noodles?/g,
        'bread': /bread|crumbs?/g,
        'potato': /potatoes?/g
    };

    const foundIngredients = new Set();
    
    // Convert text to lowercase for better matching
    text = text.toLowerCase();
    
    // Find all matching ingredients
    Object.entries(ingredientPatterns).forEach(([ingredient, pattern]) => {
        const matches = text.match(pattern);
        if (matches) {
            // Get the full matched phrase
            matches.forEach(match => {
                foundIngredients.add(match.trim());
            });
        }
    });

    return Array.from(foundIngredients);
}
function calculateGoogleMatchPercentage(matchCount) {
    // Estimate match percentage for Google results
    const basePercentage = 50; // Start at 50% for finding a relevant recipe
    const matchBonus = matchCount * 10; // Add 10% for each matched ingredient
    return Math.min(100, basePercentage + matchBonus);
}

// Recipe Card Creation
function createRecipeCard(recipe) {
    const isSpoonacular = recipe.source === 'spoonacular';
    let hostname = '';
    
    try {
        hostname = new URL(recipe.sourceUrl).hostname.replace('www.', '');
    } catch (error) {
        console.error('Invalid URL:', recipe.sourceUrl);
        hostname = 'Unknown source';
    }
    
    // Format ingredients lists
    const usedIngredients = recipe.usedIngredients
        .map(i => i.name)
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    const missedIngredients = recipe.missedIngredients
        .map(i => i.name)
        .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates
    
    const pantryItems = recipe.pantryItemsUsed || [];
    
    return `
        <div class="recipe-card">
            <div class="match-percentage">${recipe.matchPercentage}% match</div>
            <div class="source-badge">${isSpoonacular ? 'Spoonacular' : 'Web Search'}</div>
            <img src="${recipe.image}" alt="${recipe.title}" 
                onerror="this.src='https://via.placeholder.com/300x200?text=No+Image+Available'">
            <h3>${recipe.title}</h3>
            
            <p class="ingredients-have">Your ingredients used: <span class="green">
                ${usedIngredients.join(', ') || 'None detected'}
            </span></p>
            <p class="pantry-items">Pantry items included: <span class="blue">
                ${pantryItems.join(', ') || 'None detected'}
            </span></p>
            <p class="ingredients-missing">Additional ingredients needed: <span class="red">
                ${missedIngredients.join(', ') || 'None detected'}
            </span></p>
            
            ${!isSpoonacular ? `
                <p class="recipe-source">${hostname}</p>
                <p class="recipe-snippet">${recipe.snippet}</p>
            ` : ''}
            
            <button onclick="viewRecipe('${recipe.sourceUrl}')">View Recipe</button>
        </div>
    `;
}

// Utility Functions
function viewRecipe(url) {
    window.open(url, '_blank');
}

function sanitizeString(str) {
    return str.replace(/[^\w\s-]/g, '').trim();
}

// Function to expand ingredient search terms
function expandIngredientSearch(ingredient) {
    const variations = ingredientVariations[ingredient.toLowerCase()] || [];
    return [ingredient, ...variations];
}

// Error Handling
function handleApiError(error, source) {
    console.error(`${source} API Error:`, error);
    return [];
}

// Loading State Management
function showLoading(element) {
    element.innerHTML = '<p class="loading">Searching for delicious recipes...</p>';
}

function hideLoading(element) {
    element.innerHTML = '';
}

// Debug function to check API responses
function debugApiResponses(spoonacularRecipes, googleRecipes) {
    console.log('Spoonacular Recipes:', spoonacularRecipes.length, spoonacularRecipes);
    console.log('Google Recipes:', googleRecipes.length, googleRecipes);
}

// Initialize tooltips and other UI elements
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips if using them
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(tooltip => {
        // Add tooltip functionality if needed
    });
});

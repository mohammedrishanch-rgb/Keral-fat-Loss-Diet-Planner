document.addEventListener('DOMContentLoaded', () => {
    // Live Clock Logic
    const liveClock = document.getElementById('live-clock');

    function updateClock() {
        if (!liveClock) return;
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        liveClock.textContent = now.toLocaleDateString('en-US', options);
    }
    
    updateClock();
    setInterval(updateClock, 1000);

    const form = document.getElementById('diet-form');
    const formSection = document.getElementById('form-section');
    const resultSection = document.getElementById('result-section');
    const resetBtn = document.getElementById('reset-btn');

    // Result DOM Elements
    const calcCalories = document.getElementById('calc-calories');
    const calcWater = document.getElementById('calc-water');
    const calcSpeed = document.getElementById('calc-speed');
    const mealPlanGrid = document.getElementById('meal-plan-grid');
    const groceryListContainer = document.getElementById('grocery-list-container');
    const groceryListGrid = document.getElementById('grocery-list-grid');
    const regeneratePlanBtn = document.getElementById('regenerate-plan-btn');
    const generationTimestamp = document.getElementById('generation-timestamp');
    
    // Recipe Modal Elements
    const recipeModal = document.getElementById('recipe-modal');
    const closeRecipeModal = document.getElementById('close-recipe-modal');
    const recipeTitle = document.getElementById('recipe-title');
    const recipeInstructions = document.getElementById('recipe-instructions');

    let currentPref = '';
    let currentCalories = 0;

    // Close Modal Logic
    closeRecipeModal.addEventListener('click', () => {
        recipeModal.classList.add('hidden');
    });

    window.addEventListener('click', (e) => {
        if (e.target === recipeModal) {
            recipeModal.classList.add('hidden');
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Gather Inputs
        const gender = document.getElementById('gender').value;
        const age = parseInt(document.getElementById('age').value);
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value);
        const activity = parseFloat(document.getElementById('activity').value);
        const foodPref = document.getElementById('food-pref').value;
        const goalSpeed = document.getElementById('goal-speed').value;

        // Calculations
        let bmr = 0;
        if (gender === 'male') {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
        } else {
            bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
        }

        const tdee = bmr * activity;
        let targetCalories = tdee;
        let speedText = "Moderate";

        if (goalSpeed === 'slow') {
            targetCalories -= 250;
            speedText = "Slow & Steady";
        } else if (goalSpeed === 'medium') {
            targetCalories -= 500;
            speedText = "Moderate";
        } else if (goalSpeed === 'fast') {
            targetCalories -= 750;
            speedText = "Fast";
        }

        // Safety net to ensure calories don't go too low (generally shouldn't be under 1200 for women / 1500 for men)
        const minCalories = gender === 'male' ? 1500 : 1200;
        if (targetCalories < minCalories) {
            targetCalories = minCalories;
        }

        // Water Calculation (generally 30-35ml per kg, plus more for activity)
        let waterLiters = weight * 0.033;
        if (activity >= 1.55) {
            waterLiters += 0.5; // add 500ml for active folks
        }
        
        // Update DOM with Stats
        calcCalories.innerHTML = `${Math.round(targetCalories)} <span style="font-size:0.5em; font-weight:400; color:var(--text-muted)">kcal/day</span>`;
        calcWater.innerHTML = `${waterLiters.toFixed(1)} <span style="font-size:0.5em; font-weight:400; color:var(--text-muted)">Liters</span>`;
        calcSpeed.textContent = speedText;

        currentPref = foodPref;
        currentCalories = Math.round(targetCalories);

        // Generate Meal Plan
        generateMealPlan(currentPref, currentCalories);

        // Switch Views via Animation
        formSection.classList.remove('slide-in');
        formSection.classList.add('hidden');
        resultSection.classList.remove('hidden');
        
        // Ensure grocery list is visible
        groceryListContainer.style.display = 'block';

        setTimeout(() => {
            resultSection.classList.add('slide-in');
        }, 50); // slight delay for smooth transition
    });

    resetBtn.addEventListener('click', () => {
        resultSection.classList.remove('slide-in');
        resultSection.classList.add('hidden');
        formSection.classList.remove('hidden');
        setTimeout(() => {
            formSection.classList.add('slide-in');
        }, 50);
        
        // Optional: form.reset() to clear values, or keep them for easy tweaking
    });

    regeneratePlanBtn.addEventListener('click', () => {
        // Add a small animation effect to the grid
        mealPlanGrid.style.opacity = '0.5';
        setTimeout(() => {
            generateMealPlan(currentPref, currentCalories);
            mealPlanGrid.style.opacity = '1';
        }, 200);
    });

    function shuffleArray(array) {
        let currentIndex = array.length, randomIndex;
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }

    function generateMealPlan(pref, calories) {
        // Kerala Diet Datasets
        const vegBreakfasts = [
            "2 Puttu slices with 1 cup Kadala Curry (~450 kcal)",
            "3 Idlis with Sambar and half cup Coconut Chutney (~350 kcal)",
            "2 Appams with Vegetable Stew (~380 kcal)",
            "1 large bowl of Oats Upma with mixed vegetables (~300 kcal)",
            "2 Plain Dosas with Sambar and Tomato Chutney (~350 kcal)",
            "Idiyappam (3 no.s) with Green Peas Curry (~380 kcal)",
            "Poha (Aval) Upma with peanuts and vegetables (~320 kcal)"
        ];

        const nonVegBreakfasts = [
            "2 Puttu slices with 2 Boiled Eggs or Egg Roast (~450 kcal)",
            "2 Appams with Chicken Mappas or Chicken Stew (~450 kcal)",
            "3 Idlis with Sambar and 1 Boiled Egg (~400 kcal)",
            "2 Plain Dosas with Chicken Curry (less oil) (~420 kcal)",
            "Idiyappam (3 no.s) with Egg Curry (~400 kcal)",
            "Oats with sliced banana and a side of 2 boiled egg whites (~320 kcal)",
            "Puttu with Fish Curry (Meen Mulakittathu - no coconut) (~380 kcal)"
        ];

        const vegLunches = [
            "1 cup Kerala Matta Rice, Sambar, Cabbage Thoran, Moru (~450 kcal)",
            "1.5 cups mixed Vegetable Pulao with Cucumber Raita (~420 kcal)",
            "1 cup Matta Rice, Parippu (Dal), Beans Mezhukkupuratti, Salad (~460 kcal)",
            "2 Chapathis with Paneer or Soya Chunk Roast, mixed salad (~480 kcal)",
            "1 cup Matta Rice, Avial, Rasam (~470 kcal)",
            "Quinoa/Broken Wheat Upma with large portion of mixed veggies (~380 kcal)",
            "1 cup Matta Rice, Pumpkin Erissery, Kovakka Thoran (~450 kcal)"
        ];

        const nonVegLunches = [
            "1 cup Matta Rice, Ayala/Mathi Curry, Cabbage Thoran (~460 kcal)",
            "1 cup Matta Rice, Nadan Chicken Curry, Cucumber Salad (~490 kcal)",
            "2 Chapathis with lean Beef Ularthiyathu, Salad (~500 kcal)",
            "1 cup Matta Rice, Fish Moilee, Beans Thoran (~480 kcal)",
            "1.5 cups homemade Chicken Biriyani (measured rice, more chicken), Raita (~550 kcal)",
            "1 cup Matta Rice, Prawns Roast, Moru, Salad (~470 kcal)",
            "1 cup Matta Rice, Nadan Egg Curry, Spinach (Cheera) Thoran (~450 kcal)"
        ];

        const vegDinners = [
            "2 Chapathis with Green Gram (Cherupayar) Curry (~380 kcal)",
            "Large bowl of Vegetable Soup with 1 portion of grilled Tofu/Paneer (~320 kcal)",
            "2 Wheat Dosas with Tomato/Onion Chutney (~300 kcal)",
            "1 bowl of broken wheat Kanji with Payar and roasted Pappadam (~350 kcal)",
            "2 Chapathis with Mixed Vegetable Kurma (~400 kcal)",
            "Salad bowl with boiled Chana, cucumber, tomato, and lemon (~320 kcal)",
            "1 Appam with Vegetable Stew (~250 kcal)"
        ];

        const nonVegDinners = [
            "2 Chapathis with Chicken Roast or grilled chicken breast (~420 kcal)",
            "1 bowl of clear Chicken Soup with 1 boiled egg (~250 kcal)",
            "2 Wheat Dosas with Fish Curry leftover from lunch (~340 kcal)",
            "Large portion of grilled/baked Fish with a side of steamed vegetables (~350 kcal)",
            "2 Chapathis with Egg Roast (2 egg whites, 1 yolk) (~380 kcal)",
            "Broken wheat Kanji with leftover dry Chicken or Fish flakes (~360 kcal)",
            "Chicken Salad bowl (boiled chicken, cucumber, pepper, lemon) (~320 kcal)"
        ];

        let breakfasts = [...(pref === 'veg' ? vegBreakfasts : nonVegBreakfasts)];
        let lunches = [...(pref === 'veg' ? vegLunches : nonVegLunches)];
        let dinners = [...(pref === 'veg' ? vegDinners : nonVegDinners)];
        
        shuffleArray(breakfasts);
        shuffleArray(lunches);
        shuffleArray(dinners);
        
        let html = '';
        const now = new Date();
        
        // Update Timestamp
        const timeOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        generationTimestamp.textContent = `Generated on: ${now.toLocaleDateString('en-US', timeOptions)}`;
        
        for(let i = 0; i < 7; i++) {
            // Selecting meals randomly or cyclically
            const b = breakfasts[i % breakfasts.length];
            const l = lunches[i % lunches.length];
            const d = dinners[i % dinners.length];
            
            // Calculate dynamic date for the card
            let cardDate = new Date(now);
            cardDate.setDate(now.getDate() + i);
            let dayString = cardDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
            
            if (i === 0) dayString = `Today (${dayString})`;
            else if (i === 1) dayString = `Tomorrow (${dayString})`;

            // Add note about calorie adjustment
            let portionNote = "";
            if(calories < 1400) portionNote = "<span style='color:var(--primary); font-size: 0.8rem;'>(Reduce rice/roti by 25%)</span>";
            else if(calories > 2200) portionNote = "<span style='color:var(--secondary); font-size: 0.8rem;'>(Can add 1 extra roti or 0.5 cup rice)</span>";

            html += `
                <div class="day-card">
                    <div class="day-header">${dayString}</div>
                    
                    <div class="meal">
                        <div class="meal-type">Breakfast</div>
                        <div class="meal-desc">
                            ${b} <br>
                            <button class="recipe-btn" onclick="openRecipe('${b.replace(/'/g, "\\'")}')">👨‍🍳 View Recipe</button>
                        </div>
                    </div>
                    
                    <div class="meal">
                        <div class="meal-type">Lunch</div>
                        <div class="meal-desc">
                            ${l} ${portionNote} <br>
                            <button class="recipe-btn" onclick="openRecipe('${l.replace(/'/g, "\\'")}')">👨‍🍳 View Recipe</button>
                        </div>
                    </div>
                    
                    <div class="meal">
                        <div class="meal-type">Dinner (Light)</div>
                        <div class="meal-desc">
                            ${d} <br>
                            <button class="recipe-btn" onclick="openRecipe('${d.replace(/'/g, "\\'")}')">👨‍🍳 View Recipe</button>
                        </div>
                    </div>
                </div>
            `;
        }

        mealPlanGrid.innerHTML = html;
        generateGroceryList(pref);
    }

    function generateGroceryList(pref) {
        let categories = {
            "Produce (Veggies & Fruits)": [
                "Onions & Shallots (1 kg)", "Tomatoes (1 kg)", "Green Chillies & Ginger (100g each)", 
                "Curry Leaves & Coriander (2 bunches)", "Cabbage / Carrots / Beans (1.5 kg total)", 
                "Cucumber (1 kg) & Lemons (10 pcs)"
            ],
            "Pantry & Grains": [
                "Kerala Matta Rice (1.5 kg - 2 kg)", "Wheat Flour (Atta) (1.5 kg)", "Puttu Podi (Rice/Wheat) (1 kg)",
                "Oats / Poha (Aval) (500g)", "Coconut (Grated/Pieces) (2-3 whole)"
            ],
            "Proteins & Pulses": [
                "Kadala (Black Chickpeas) (500g)", "Cherupayar (Green Gram) (250g)", "Toor/Moong Dal (500g)",
                "Eggs (1 Tray - 30 nos)"
            ],
            "Dairy & Misc": [
                "Milk (3 L)", "Curd / Buttermilk (1.5 L)", "Cold-pressed Coconut Oil (500ml)"
            ]
        };

        if (pref === 'non-veg') {
            categories["Proteins & Pulses"] = [
                "Eggs (1 Tray - 30 nos)", "Chicken Breast/Thighs (1 kg - 1.5 kg)", 
                "Fish (Ayala/Mathi) (1 kg)", "Lean Beef (optional) (500g)",
                "Kadala (Black Chickpeas) (250g)", "Toor/Moong Dal (250g)"
            ];
        } else {
            categories["Proteins & Pulses"].push("Paneer or Tofu (400g - 500g)");
            categories["Produce (Veggies & Fruits)"].push("Extra Veggies for Stews/Kurma (1 kg)");
        }

        let groceryHtml = '';
        for (const [category, items] of Object.entries(categories)) {
            let itemsHtml = items.map(item => `<li>${item}</li>`).join('');
            groceryHtml += `
                <div class="grocery-category">
                    <h4>${category}</h4>
                    <ul>${itemsHtml}</ul>
                </div>
            `;
        }

        groceryListGrid.innerHTML = groceryHtml;
    }

    // Global function to open recipes
    window.openRecipe = function(mealName) {
        let title = mealName.split('(')[0].trim(); // Extract roughly the main name without calories
        let instructions = '';

        const nameLower = mealName.toLowerCase();

        if (nameLower.includes('puttu')) {
            instructions += `
                <h4>Puttu (Steamed Rice Cake)</h4>
                <ol>
                    <li>Lightly roast rice flour. Add salt and sprinkle water gradually until the mixture resembles coarse sand (should hold shape when pressed, but crumble easily).</li>
                    <li>Layer the Puttu maker (Kutti) with 1 tbsp of freshly grated coconut, followed by the wet rice flour, and top off with more coconut.</li>
                    <li>Steam for 5-7 minutes until steam escapes from the top.</li>
                </ol>
            `;
        }
        if (nameLower.includes('kadala')) {
            instructions += `
                <h4>Kadala Curry (Black Chickpeas)</h4>
                <ol>
                    <li>Soak black chickpeas overnight (8 hours). Pressure cook with salt and a pinch of turmeric until soft (usually 4-5 whistles).</li>
                    <li>In a pan, heat coconut oil. Sauté sliced sliced onions, minced ginger, and garlic until golden.</li>
                    <li>Add coriander powder, chilli powder, and garam masala. Add sliced tomatoes and cook until soft.</li>
                    <li>Add the cooked chickpeas, simmer for 10 mins. Finish by tempering mustard seeds, dry red chillies, and curry leaves in coconut oil and adding to the curry.</li>
                </ol>
            `;
        }
        if (nameLower.includes('appam')) {
             instructions += `
                <h4>Appam</h4>
                <ol>
                    <li>Soak raw rice for 4 hours. Grind it to a smooth batter with a handful of cooked rice, yeast, and a little coconut water/sugar.</li>
                    <li>Let it ferment overnight (8 hours).</li>
                    <li>Pour a ladle of batter into an Appachatti (curved pan), swirl it around to coat the edges thinly, cover and cook until the center is fluffy and edges are crisp.</li>
                </ol>
            `;
        }
        if (nameLower.includes('stew')) {
             instructions += `
                <h4>Kerala Stew (Veg / Chicken)</h4>
                <ol>
                    <li>Heat coconut oil, add whole spices (cinnamon, cloves, cardamom). Sauté ginger, green chillies, and onions until translucent (do not brown).</li>
                    <li>Add your vegetables (carrot, potato, beans) or Chicken. Sauté briefly.</li>
                    <li>Add thin coconut milk (2nd extract) and cook until the meat/veggies are tender.</li>
                    <li>Lower the heat, add thick coconut milk (1st extract), a pinch of black pepper, and curry leaves. Remove from heat immediately so the milk doesn't curdle.</li>
                </ol>
            `;
        }
        if (nameLower.includes('chicken') && !nameLower.includes('stew')) {
            instructions += `
                <h4>Kerala Chicken Curry / Roast</h4>
                <ol>
                    <li>Marinate chicken pieces with turmeric, chilli powder, pepper, and salt for 30 mins.</li>
                    <li>Heat coconut oil. Sauté thinly sliced onions, ginger-garlic paste, and green chillies until deeply caramelized.</li>
                    <li>Add tomatoes and cook until oil separates. Toss in the marinated chicken and cook on high heat for 5 mins to seal juices.</li>
                    <li>Add half a cup of water, cover and simmer until chicken is fully cooked. Garnish generously with curry leaves.</li>
                </ol>
            `;
        }
        if (nameLower.includes('fish')) {
            instructions += `
                <h4>Meen Curry (Kerala Fish Curry)</h4>
                <ol>
                    <li>Heat coconut oil in an earthen pot (Chatti). Crackle mustard seeds and fenugreek.</li>
                    <li>Sauté chopped shallots, ginger, and green chillies. Make a paste of Kashmiri chilli powder, coriander powder, and turmeric with a bit of water; add it to the pan and fry until fragrant.</li>
                    <li>Add warm water, salt, and soaked Kokum (Kudampuli) pieces. Bring to a rolling boil.</li>
                    <li>Slide in cleaned fish pieces. Cover and simmer until the fish is flaky and the gravy thickens slightly. Finish with curry leaves and a tiny drizzle of raw coconut oil.</li>
                </ol>
            `;
        }
        if (nameLower.includes('dosa') || nameLower.includes('idli')) {
            instructions += `
                <h4>Dosa / Idli</h4>
                <ol>
                    <li>Soak 3 parts Idli rice and 1 part whole Urad Dal separately for 6 hours. (Add 1 tsp fenugreek seeds to the dal).</li>
                    <li>Grind the dal to a fluffy smooth batter. Grind the rice to a slightly coarse batter. Mix them together with salt.</li>
                    <li>Let it ferment in a warm place for 8-12 hours until doubled.</li>
                    <li>For Dosa: Spread thinly on a hot greased griddle. For Idli: Pour into greased steaming plates and steam for 10-12 mins.</li>
                </ol>
            `;
        }
        
        // Fallback generic instructions
        if (instructions === '') {
            instructions = `
                <h4>Cooking Guidelines</h4>
                <ul>
                    <li><strong>Proteins (Eggs, Beef, Paneer):</strong> Ensure they are cooked thoroughly. Use minimal coconut oil for sautéing to keep it diet-friendly. Flavor prominently with black pepper, curry leaves, and ginger.</li>
                    <li><strong>Veggies (Thoran/Mezhukkupuratti):</strong> Finely chop vegetables. Give a simple temper of mustard seeds and curry leaves. Add veggies, cover and steam-cook in their own juices. Finish with just 1-2 tbsp of grated coconut.</li>
                    <li><strong>Carbs (Rice/Upma/Kanji):</strong> Use an appropriate water ratio (generally 1:2 or 1:3 for Matta rice). Pressure cooking Matta rice takes roughly 5-6 whistles due to its thick bran layer.</li>
                    <li><em>Remember: This is a fat-loss plan—keep your oil usage under 1 tsp per serving where possible, relying instead on dry roasting or steaming techniques!</em></li>
                </ul>
            `;
        }

        recipeTitle.textContent = title;
        recipeInstructions.innerHTML = instructions;
        recipeModal.classList.remove('hidden');
    }
});

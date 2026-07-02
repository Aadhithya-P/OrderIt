const catchAsync = require("../middlewares/catchAsyncErrors");
const aiService = require("../services/ai.service");
const FoodItem = require("../models/foodItem")


const Restaurant = require("../models/restaurant");
const { analyzeReviewsWithAI } = require("../services/aiReviewAnalyzer");

exports.generateFoodAI = catchAsync(async(req, res) => {
    const {name, category, spiceLevel, price} = req.body;
    if(!name || !category || !spiceLevel || !price){
        return res.status(400).json({
            success: false,
            message:"name, category, spiceLevel and price are required"
        })
    }

    const aiData = await aiService.generateDishDescription({
        name,
        category, spiceLevel,
        price
    })

    res.status(200).json({
        success: true,
        data: aiData,
    })
})


exports.generateAndSaveFoodAI = catchAsync(async(req, res) => {
    const {foodId} = req.params;

    const food = await FoodItem.findById(foodId);
    if(!food){
        return res.status(404).json({
            success: false,
            message: "Food item not found"
        })
    }

    const aiData = await aiService.generateDishDescription({
        name: food.name,
        category: food.category || "Veg",
        spiceLevel: food.spiceLevel || "Medium",
        price: food.price
    })

    food.aiDescription = aiData.description;
    food.aiTags = aiData.tags;
    food.aiAllergens = aiData.allergens;
    food.aiServes = aiData.serves;
    food.aiBestFor = aiData.bestFor;
    await food.save();
    res.status(200).json({
        success: true,
        message: "AI metadata generated and saved",
        data: aiData,
    })
})

exports.analyzeRestaurantReviews = catchAsync(async(req, res) => {
    try{
        const {id} = req.params;
        console.log("STEP 1: ID =", id);

        const restaurant = await Restaurant.findById(id);
        console.log("STEP 2: Restaurant found =", !!restaurant);

        if(!restaurant){
            return res.status(404).json({message: "Restaurant not found"})
        }

        console.log("STEP 3: Reviews count =", restaurant.reviews.length);

        if(!restaurant.reviews.length){
            return res.status(400).json({message: "No reviews to analyze"})
        }

        console.log("STEP 4: Calling AI...");

        const aiData = await analyzeReviewsWithAI(restaurant.reviews);

        console.log("STEP 5: AI DATA =", aiData);

        restaurant.reviewSentiment = aiData.sentiment;
        restaurant.reviewSummaryBullets = aiData.summaryBullets;
        restaurant.reviewTopMentions = aiData.topMentions;

        console.log("STEP 6: Saving to DB...");

        await restaurant.save();

        console.log("STEP 7: SUCCESS");

        res.status(200).json({success: true, aiData})

    }catch(error){
        console.error("🔥 ERROR OCCURRED:", error.message);
        res.status(500).json({message: error.message})
    }
});
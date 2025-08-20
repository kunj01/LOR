import { PrismaClient } from "@prisma/client";
import {ApiResponse} from "../utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";

const prisma = new PrismaClient();

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, categories, "Categories fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching categories:", error);
    return res.status(500).json(
      new ApiError(500, "Internal server error while fetching categories")
    );
  }
};

// Get subcategories by category
export const getSubCategories = async (req, res) => {
  try {
    const { category } = req.params;
    
    const subCategories = await prisma.sub_Catagory.findMany({
      where: {
        catagoryId: parseInt(category),
      },
      select: {
        id: true,
        name: true,
        mode_applicable: true,
        default_mode: true,
        winners_applicable: true,
        position_type: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, subCategories, "Subcategories fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return res.status(500).json(
      new ApiError(500, "Internal server error while fetching subcategories")
    );
  }
};

// Get nature by subcategory
export const getNature = async (req, res) => {
  try {
    const { subcategory } = req.params;
    
    const nature = await prisma.nature.findMany({
      where: {
        subCatagoryId: parseInt(subcategory),
      },
      select: {
        id: true,
        name: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, nature, "Nature fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching nature:", error);
    return res.status(500).json(
      new ApiError(500, "Internal server error while fetching nature")
    );
  }
};

// Get activities by nature
export const getActivity = async (req, res) => {
  try {
    const { nature } = req.params;
    
    const activities = await prisma.activity.findMany({
      where: {
        natureId: parseInt(nature),
      },
      select: {
        id: true,
        level: true,
        points: true,
      },
    });

    return res.status(200).json(
      new ApiResponse(200, activities, "Activities fetched successfully")
    );
  } catch (error) {
    console.error("Error fetching activities:", error);
    return res.status(500).json(
      new ApiError(500, "Internal server error while fetching activities")
    );
  }
};

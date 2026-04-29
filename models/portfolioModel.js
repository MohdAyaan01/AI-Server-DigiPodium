import mongoose, {Schema} from "mongoose";

const PortfolioSchema = new Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true
  },
  templateId:{
    type: String,
  },
  content:{
    fullName: String,
    professionalBio: String,
    skills: Object,
    experience: String,
    projects: Array,
    contactInfo: Object,
  }
},{timestamps: true})

export const Portfolio = mongoose.model("Portfolio",PortfolioSchema)
import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
    title:{type:String},
    description:{type:String},
    tag:{type:[String]},
    image:{type:String},  
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
      uploader: { type: mongoose.Schema.Types.ObjectId,  ref: 'User' },
    userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
    createdAt:{type:Date,default:Date.now},


});
export default mongoose.model('Post',postSchema);
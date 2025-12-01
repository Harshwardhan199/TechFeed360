// import mongoose from 'mongoose';

// const articleSchema = new mongoose.Schema({
//     title: { type: String, required: true },
//     slug: { type: String, required: true, unique: true, index: true },
//     summary: { type: String },
//     content: { type: String },
//     image: { type: String },
//     tags: [{ type: String }],
//     category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
//     source: { type: String },
//     source_url: { type: String },
//     published_at: { type: Date },
//     views: { type: Number, default: 0 },
//     hash: { type: String, unique: true, index: true },
// }, { timestamps: true });

// articleSchema.index({ title: 'text', summary: 'text', content: 'text' });

// export default mongoose.model('Article', articleSchema);

import mongoose from 'mongoose';

const articleSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    summary: { type: String },
    content: { type: String },
    image: { type: String },
    tags: [{ type: String }],

    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

    source: { type: String },
    source_url: { type: String },
    published_at: { type: Date },

    views: { type: Number, default: 0 },
    hash: { type: String, unique: true, index: true },

    status: { type: String, enum: ['pending', 'published'], default: 'pending' },
    key_takeaways: [{ type: String }],
    original_sources: [{ type: String }],
    domain: { type: String }
}, { timestamps: true });

articleSchema.index({ title: 'text', summary: 'text', content: 'text' });

export default mongoose.model('Article', articleSchema);

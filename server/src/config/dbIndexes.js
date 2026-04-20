/**
 * dbIndexes.js
 *
 * This file is intentionally reserved for any additional MongoDB index
 * creation that cannot be expressed as Mongoose schema-level indexes
 * (e.g. text indexes, 2dsphere indexes, or compound indexes across models).
 *
 * Current indexes are defined directly on the Mongoose schemas:
 *   - PDF:        user+title, tags, sharedWith.user, status, collections, parentDocument
 *   - Collection: user+name, tags, sharedWith.user
 *   - Chat:       pdfId+createdAt, userId+createdAt
 *
 * To create additional indexes programmatically, import the relevant models
 * here and call model.collection.createIndex(...) after the DB connects.
 */

// Example (uncomment and modify as needed):
// import PDF from '../models/pdf.model.js';
// export const createExtraIndexes = async () => {
//   await PDF.collection.createIndex(
//     { title: 'text', 'metadata.subject': 'text' },
//     { name: 'pdf_text_search' }
//   );
// };

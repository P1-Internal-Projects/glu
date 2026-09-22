/**
 * Horizontal 64px / vertical 24px — shared by Puck blocks.
 *
 * The `glu-block-pad` marker carries no styling. It exists so a parent can
 * neutralise the horizontal padding when a block is nested inside something
 * that already owns the measure — GLUArticleSection draws its own Container,
 * and without this the two paddings stack and squeeze the column. Matching on
 * the literal `.px-16` would work until someone changed the value here, so the
 * hook is named instead.
 */
export const blockPaddingClass = "glu-block-pad px-16 py-6";

import z from "zod";
export const signupInput=z.object({
    username:z.string().email(),
    password:z.string().min(6),
    name:z.string().optional()
})

// type inference in zod 


export const signinInput=z.object({
    username:z.string().email(),
    password:z.string().min(6),
    name:z.string().optional()
})

// type inference in zod 


export const createBlogInput=z.object({
    title: z.string(),
    content:z.string()
})
//type inferencing in zod


export const updateBlogInput=z.object({
    title: z.string(),
    content: z.string(),
    id: z.string()
})
//type inferencing in zod
export type UpdateBlogInput=z.infer<typeof updateBlogInput>
export type CreateBlogInput=z.infer<typeof createBlogInput>;
export type SigninInput= z.infer<typeof signinInput>;
export type SignupInput= z.infer<typeof signupInput>;

// Bascially commom file gets uploaded NPM npm login and npm publish --access public
// backend/frontend file route me npm i  @aneekphoenix/medium-common
// use as required
import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { Context } from 'hono';
import { sign, verify} from 'hono/jwt'
import { createBlogInput, CreateBlogInput,updateBlogInput } from "@aneekphoenix/medium-common";
// similar to app =new exprees()
export const blogRouter=new Hono<{
    //environment variables
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	},
    // extra context variables

    Variables:{
        userId:string;
    }
}>();
// api/v1/blog---> every time JWT token must be passed, with respect to any individuals memebers.
//Middleware
//extract the user id
//pass it to the route handler
blogRouter.use('/*', async (c:Context, next) => {
    const jwt = c.req.header('Authorization');
	if (!jwt) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	const token = jwt.split(' ')[1];
	const payload = await verify(token, c.env.JWT_SECRET);
	if (!payload) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	c.set('userId', payload.id);
	await next()
   
})
// api/v1/blog/* first middleware - gets the jwt token and synchronizes.
// extracts out the userId from the jwt token.

//Routing : get particular id:blog/post dynamic parameter id.
blogRouter.get('/:id', async(c) => {
    const id = c.req.param('id');
    //declaring Prisma 
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const post = await prisma.post.findUnique({
		where: {
			id
		}
	});

	return c.json(post);
})
// Routing POST
blogRouter.post('/', async(c) => {
    const body=await c.req.json()
	  const { success }=createBlogInput.safeParse(body);
		if(!success)
		{c.status(411)
			return c.json({message: "Inputs Not Correct"})
		}
    const authorId=c.get("userId");
	const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: authorId
		}
	});
	return c.json({
		id: post.id
	});
})
//Routing - update/put specific blog 
blogRouter.put('/',async (c) => {
    const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const { success }=updateBlogInput.safeParse(body);
	if(!success)
	{c.status(411)
		return c.json({message: "Inputs Not Correct"})
	}
	prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
})

//Routing - Gets all blogs/posts
blogRouter.get('/bulk', async (c) => {
    const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	
	const posts = await prisma.post.findMany({});

	return c.json(posts);
})

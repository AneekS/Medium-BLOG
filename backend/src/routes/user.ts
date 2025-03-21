import { Hono } from "hono";
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign, verify} from 'hono/jwt'
import { signupInput,signinInput } from "@aneekphoenix/medium-common";
export const userRouter=new Hono<{
	Bindings: {
		DATABASE_URL: string,
		JWT_SECRET: string,
	}
}>();

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const { success }=signupInput.safeParse(body);
    if(!success)
    {c.status(411)
        return c.json({message: "Inputs Not Correct"})
    }
    try {
        const user = await prisma.user.create({
            data: {
                email: body.username,
                password: body.password
            }
        });
        const token = await sign({ id: user.id }, c.env.JWT_SECRET);
        return c.json({ jwt:token });
    } catch(e) {
        c.status(403);
        return c.json({ error: "error while signing up" });
    }
})


userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const { success }=signinInput.safeParse(body);
    if(!success)
    {c.status(411)
        return c.json({message: "Inputs Not Correct"})
    }
    const user = await prisma.user.findUnique({
        where: {
            email: body.username
        }
    });

    if (!user) {
        c.status(403);
        return c.json({ error: "user not found" });
    }
    // both sign-up and sign-in routes returns sign JWT token
    // manually jwt tken passed as Authorization key in  api/v1/blog/*
    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ jwt });
})


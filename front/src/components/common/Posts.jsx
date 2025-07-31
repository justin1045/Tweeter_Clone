import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";

const Posts = ({ feedType }) => {
	const getPostEndpoint = () => {
		switch (feedType) {
			case "forYou":
				return "/api/v1/posts/all";
			case "following":
				return "/api/v1/posts/following";
			default:
				return "/api/v1/posts/all";
		}
	};

	const POST_ENDPOINT = getPostEndpoint();

	const {
		data: posts = [],
		isLoading,
		isError,
		isRefetching,
		error,
	} = useQuery({
		queryKey: ["posts", feedType],
		queryFn: async () => {
			const res = await fetch(POST_ENDPOINT);
			const data = await res.json();

			if (!res.ok) throw new Error(data.error || "Something went wrong");

			// ensure it's an array
			return Array.isArray(data) ? data : (data.posts || []);
		},
		refetchOnWindowFocus: false,
	});

	console.log("📦 posts:", posts);

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className='flex flex-col justify-center'>
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}

			{isError && (
				<p className='text-center text-red-500'>
					Error loading posts: {error.message}
				</p>
			)}

			{!isLoading && !isRefetching && posts.length === 0 && (
				<p className='text-center my-4'>No posts in this tab. Switch 👻</p>
			)}

			{!isLoading && posts.length > 0 && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};

export default Posts;

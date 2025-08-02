import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { FaArrowLeft, FaLink } from "react-icons/fa6";
import { IoCalendarOutline } from "react-icons/io5";
import { MdEdit } from "react-icons/md";

import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";
import Posts from "../../components/common/Posts";
import useFollow from "../../hooks/useFollow"; // ✅ import hook
import toast from "react-hot-toast";
import { formatMembersSinceDate } from "../../utils/date";

const ProfilePage = () => {
	const { username } = useParams();
	const [coverImg, setCoverImg] = useState(null);
	const [profileImg, setProfileImg] = useState(null);
	const [feedType, setFeedType] = useState("posts");

	const coverImgRef = useRef(null);
	const profileImgRef = useRef(null);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: user, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["userProfile", username],
		queryFn: async () => {
			const res = await fetch(`/api/v1/users/profile/${username}`);
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
	});

	const isMyProfile = authUser?.username === username;

	const membersSinceDate = formatMembersSinceDate(user?.createdAt);

	// ✅ use toggle follow hook
	const { toggleFollow, isPending } = useFollow();

	const isAlreadyFollowing = authUser?.following?.includes(user?._id);

	const handleImgChange = (e, state) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = () => {
				if (state === "coverImg") setCoverImg(reader.result);
				if (state === "profileImg") setProfileImg(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	useEffect(() => {
		refetch();
	}, [username, refetch]);

	if (isLoading || isRefetching) return <ProfileHeaderSkeleton />;
	if (!user) return <p className="text-center text-lg mt-4">User not found</p>;

	return (
		<div className="flex-[4_4_0] border-r border-gray-700 min-h-screen">
			{/* Header */}
			<div className="flex gap-10 px-4 py-2 items-center">
				<Link to="/">
					<FaArrowLeft className="w-4 h-4" />
				</Link>
				<div className="flex flex-col">
					<p className="font-bold text-lg">{user.fullName}</p>
					<span className="text-sm text-slate-500">{user.posts?.length || 0} posts</span>
				</div>
			</div>

			{/* Cover Image */}
			<div className="relative group/cover">
				<img
					src={coverImg || user.coverImg || "/cover.png"}
					className="h-52 w-full object-cover"
					alt="cover image"
				/>
				{isMyProfile && (
					<div
						className="absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200"
						onClick={() => coverImgRef.current.click()}
					>
						<MdEdit className="w-5 h-5 text-white" />
					</div>
				)}
				<input type="file" accept="image/*" hidden ref={coverImgRef} onChange={(e) => handleImgChange(e, "coverImg")} />
				<input type="file" accept="image/*" hidden ref={profileImgRef} onChange={(e) => handleImgChange(e, "profileImg")} />

				{/* Profile Image */}
				<div className="avatar absolute -bottom-16 left-4">
					<div className="w-32 rounded-full relative group/avatar">
						<img src={profileImg || user.profileImg || "/avatar-placeholder.png"} />
						{isMyProfile && (
							<div className="absolute top-5 right-3 p-1 bg-primary rounded-full group-hover/avatar:opacity-100 opacity-0 cursor-pointer">
								<MdEdit className="w-4 h-4 text-white" onClick={() => profileImgRef.current.click()} />
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Buttons */}
			<div className="flex justify-end px-4 mt-5">
				{isMyProfile && <EditProfileModal />}
				{!isMyProfile && (
					<button
						className={`btn rounded-full btn-sm ${
							isAlreadyFollowing ? "btn-outline text-white border-white" : "btn-primary text-white"
						}`}
						onClick={() => toggleFollow(user._id)}
						disabled={isPending}
					>
						{isPending
							? "Processing..."
							: isAlreadyFollowing
							? "Unfollow"
							: "Follow"}
					</button>
				)}
				{(coverImg || profileImg) && (
					<button className="btn btn-primary rounded-full btn-sm text-white px-4 ml-2" onClick={() => toast.success("Profile updated")}>
						Update
					</button>
				)}
			</div>

			{/* Profile Info */}
			<div className="flex flex-col gap-4 mt-14 px-4">
				<div className="flex flex-col">
					<span className="font-bold text-lg">{user.fullName}</span>
					<span className="text-sm text-slate-500">@{user.username}</span>
					<span className="text-sm my-1">{user.bio}</span>
				</div>

				<div className="flex gap-2 flex-wrap">
					{user.link && (
						<div className="flex gap-1 items-center">
							<FaLink className="w-3 h-3 text-slate-500" />
							<a
								href={user.link}
								target="_blank"
								rel="noreferrer"
								className="text-sm text-blue-500 hover:underline"
							>
								{user.link.replace(/^https?:\/\//, "")}
							</a>
						</div>
					)}
					<div className="flex gap-2 items-center">
						<IoCalendarOutline className="w-4 h-4 text-slate-500" />
						<span className="text-sm text-slate-500">{membersSinceDate}</span>
					</div>
				</div>

				<div className="flex gap-2">
					<div className="flex gap-1 items-center">
						<span className="font-bold text-xs">{user.following?.length}</span>
						<span className="text-slate-500 text-xs">Following</span>
					</div>
					<div className="flex gap-1 items-center">
						<span className="font-bold text-xs">{user.followers?.length}</span>
						<span className="text-slate-500 text-xs">Followers</span>
					</div>
				</div>
			</div>

			{/* Feed Toggle */}
			<div className="flex w-full border-b border-gray-700 mt-4">
				<div
					className={`flex justify-center flex-1 p-3 relative cursor-pointer ${
						feedType === "posts" ? "text-white" : "text-slate-500"
					}`}
					onClick={() => setFeedType("posts")}
				>
					Posts
					{feedType === "posts" && <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />}
				</div>
				<div
					className={`flex justify-center flex-1 p-3 relative cursor-pointer ${
						feedType === "likes" ? "text-white" : "text-slate-500"
					}`}
					onClick={() => setFeedType("likes")}
				>
					Likes
					{feedType === "likes" && <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary" />}
				</div>
			</div>

			{/* Posts Section */}
			<Posts feedType={feedType} username={username} userId={user?._id} />
		</div>
	);
};

export default ProfilePage;

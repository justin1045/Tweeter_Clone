// hooks/useToggleFollow.js
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: toggleFollow, isPending } = useMutation({
		mutationFn: async (userId) => {
			const res = await fetch(`/api/v1/users/follow/${userId}`, {
				method: "POST",
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Something went wrong");
			return data;
		},
		onSuccess: (data) => {
			toast.success(data.message); // 👈 will show "followed" or "unfollowed"
			// refetch affected data
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			queryClient.invalidateQueries({ queryKey: ["userProfile"] });
			queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	return { toggleFollow, isPending };
};

export default useFollow;

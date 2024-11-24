import { db } from "@/lib/db";
import { characterOptions } from "@/lib/query";
import { savedCharacters } from "@/lib/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string) => {
      const exists = await db.$count(
        savedCharacters,
        eq(savedCharacters.characterSlug, slug)
      );

      if (exists) {
        return db
          .delete(savedCharacters)
          .where(eq(savedCharacters.characterSlug, slug));
      }

      const character = await queryClient.ensureQueryData(
        characterOptions(slug)
      );
      return db
        .insert(savedCharacters)
        .values({ characterSlug: slug, characterName: character.name });
    },
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["characters", "saved"] }),
  });
}

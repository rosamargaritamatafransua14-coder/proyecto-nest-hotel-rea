/*
  Warnings:

  - The primary key for the `huesped` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nombre_permiso` on the `permiso` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre_rol]` on the table `permiso` will be added. If there are existing duplicate values, this will fail.
  - Changed the type of `id_huesped` on the `huesped` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `nombre_rol` to the `permiso` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `id_huesped` on the `reserva` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "reserva" DROP CONSTRAINT "reserva_id_huesped_fkey";

-- AlterTable
ALTER TABLE "bitacora" ALTER COLUMN "registro_id" SET DATA TYPE VARCHAR(40);

-- AlterTable
ALTER TABLE "huesped" DROP CONSTRAINT "huesped_pkey",
DROP COLUMN "id_huesped",
ADD COLUMN     "id_huesped" UUID NOT NULL,
ADD CONSTRAINT "huesped_pkey" PRIMARY KEY ("id_huesped");

-- AlterTable
ALTER TABLE "permiso" DROP COLUMN "nombre_permiso",
ADD COLUMN     "nombre_rol" VARCHAR(50) NOT NULL;

-- AlterTable
ALTER TABLE "reserva" DROP COLUMN "id_huesped",
ADD COLUMN     "id_huesped" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "permiso_nombre_rol_key" ON "permiso"("nombre_rol");

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_id_huesped_fkey" FOREIGN KEY ("id_huesped") REFERENCES "huesped"("id_huesped") ON DELETE RESTRICT ON UPDATE CASCADE;

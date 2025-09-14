import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateProductsTable1757849388388 implements MigrationInterface {
    name = 'CreateProductsTable1757849388388'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`product_images\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`image_url\` varchar(500) NOT NULL, \`alt_text\` varchar(255) NULL, \`sort_order\` int NOT NULL DEFAULT '0', \`is_primary\` tinyint NOT NULL DEFAULT 0, \`product_id\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`products\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`slug\` varchar(255) NOT NULL, \`description\` text NOT NULL, \`short_description\` varchar(500) NOT NULL, \`sku\` varchar(100) NOT NULL, \`price\` decimal(10,2) NOT NULL, \`compare_price\` decimal(10,2) NULL, \`cost_price\` decimal(10,2) NULL, \`stock_quantity\` int NOT NULL, \`low_stock_threshold\` int NOT NULL, \`weight\` decimal(8,2) NULL, \`dimensions\` json NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`is_featured\` tinyint NOT NULL DEFAULT 0, \`vendor_id\` varchar(255) NOT NULL, \`category_id\` varchar(255) NOT NULL, \`vendorId\` varchar(36) NULL, \`categoryId\` varchar(36) NULL, INDEX \`IDX_0e859a83f1dd6b774c20c02885\` (\`vendor_id\`), INDEX \`IDX_9a5f6868c96e0069e699f33e12\` (\`category_id\`), INDEX \`IDX_75895eeb1903f8a17816dafe0a\` (\`price\`), UNIQUE INDEX \`IDX_464f927ae360106b783ed0b410\` (\`slug\`), UNIQUE INDEX \`IDX_c44ac33a05b144dd0d9ddcf932\` (\`sku\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`vendors\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user_id\` varchar(255) NOT NULL, \`business_name\` varchar(255) NOT NULL, \`business_type\` enum ('individual', 'corporation', 'llc', 'partnership', 'sole_proprietorship') NOT NULL, \`tax_id\` varchar(50) NULL, \`business_address\` json NOT NULL, \`contact_email\` varchar(255) NOT NULL, \`contact_phone\` varchar(20) NOT NULL, \`description\` text NULL, \`logo\` varchar(255) NULL, \`website\` varchar(255) NULL, \`status\` enum ('pending', 'approved', 'suspended') NOT NULL DEFAULT 'pending', \`commission_rate\` decimal(5,2) NOT NULL, \`payment_info\` json NOT NULL, \`is_active\` tinyint NOT NULL DEFAULT 1, \`approved_at\` timestamp NULL, UNIQUE INDEX \`IDX_65b4134d1ddc73872e6abee2c1\` (\`user_id\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`product_images\` ADD CONSTRAINT \`FK_4f166bb8c2bfcef2498d97b4068\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_6b00af9e9c38a1673f594de74f4\` FOREIGN KEY (\`vendorId\`) REFERENCES \`vendors\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`products\` ADD CONSTRAINT \`FK_ff56834e735fa78a15d0cf21926\` FOREIGN KEY (\`categoryId\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_ff56834e735fa78a15d0cf21926\``);
        await queryRunner.query(`ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_6b00af9e9c38a1673f594de74f4\``);
        await queryRunner.query(`ALTER TABLE \`product_images\` DROP FOREIGN KEY \`FK_4f166bb8c2bfcef2498d97b4068\``);
        await queryRunner.query(`DROP INDEX \`IDX_65b4134d1ddc73872e6abee2c1\` ON \`vendors\``);
        await queryRunner.query(`DROP TABLE \`vendors\``);
        await queryRunner.query(`DROP INDEX \`IDX_c44ac33a05b144dd0d9ddcf932\` ON \`products\``);
        await queryRunner.query(`DROP INDEX \`IDX_464f927ae360106b783ed0b410\` ON \`products\``);
        await queryRunner.query(`DROP INDEX \`IDX_75895eeb1903f8a17816dafe0a\` ON \`products\``);
        await queryRunner.query(`DROP INDEX \`IDX_9a5f6868c96e0069e699f33e12\` ON \`products\``);
        await queryRunner.query(`DROP INDEX \`IDX_0e859a83f1dd6b774c20c02885\` ON \`products\``);
        await queryRunner.query(`DROP TABLE \`products\``);
        await queryRunner.query(`DROP TABLE \`product_images\``);
    }

}

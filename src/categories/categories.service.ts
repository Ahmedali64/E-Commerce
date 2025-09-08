import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Categories } from './entities/categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

interface MysqlQueryFailedError extends QueryFailedError {
  code: string;
}

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Categories)
    private readonly categoriesRepo: Repository<Categories>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [categories, total] = await this.categoriesRepo.findAndCount({
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
      skip,
      take: limit,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      data: categories,
      // Extra data
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Categories> {
    const { name, slug, parentId, description, imageUrl, sortOrder } =
      createCategoryDto;

    // Check if name or slug already exists else auto return an err
    await this.checkUniqueConstraints(name, slug);

    // Validate parent exists if parentId provided for a child category
    let parent: Categories | null = null;
    if (parentId) {
      parent = await this.findOneById(parentId);
      if (!parent) {
        throw new NotFoundException(
          `Parent category with ID ${parentId} not found`,
        );
      }
    }

    // Create new category
    const category = this.categoriesRepo.create({
      name,
      slug,
      description: description || null,
      imageUrl: imageUrl || null,
      parentId: parentId || null,
      sortOrder: sortOrder || 0,
      isActive: true,
    });

    try {
      return await this.categoriesRepo.save(category);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const dbError = error as MysqlQueryFailedError;
        //MYSQL 1062 code for dublicated fields err
        if (dbError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('Category name or slug already exists');
        }
      }
      throw error;
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Categories> {
    const category = await this.findOneById(id);

    const { name, slug } = updateCategoryDto;

    // Check if new name or slug conflicts with other categories
    if (name && name !== category.name) {
      await this.checkNameExists(name, id);
    }
    if (slug && slug !== category.slug) {
      await this.checkSlugExists(slug, id);
    }

    // Update category
    Object.assign(category, updateCategoryDto);

    try {
      return await this.categoriesRepo.save(category);
    } catch (error: unknown) {
      if (error instanceof Error) {
        const dbError = error as MysqlQueryFailedError;
        // MYSQL 1062 code for dublicated fields err
        if (dbError.code === 'ER_DUP_ENTRY') {
          throw new ConflictException('Category name or slug already exists');
        }
      }
      throw error;
    }
  }

  async getTree(): Promise<Categories[]> {
    // Get all categories with their relationships
    const categories = await this.categoriesRepo.find({
      relations: ['children', 'parent'],
      where: { isActive: true },
      order: { sortOrder: 'ASC', name: 'ASC' },
    });

    // Build tree structure - only return root categories
    // Children are automatically loaded through relations
    const tree = categories.filter((category) => category.isRoot);

    // Recursively sort children
    this.sortTreeChildren(tree);

    return tree;
  }

  async findOneById(id: string): Promise<Categories> {
    const category = await this.categoriesRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async findBySlug(slug: string): Promise<Categories> {
    const category = await this.categoriesRepo.findOne({
      where: { slug, isActive: true },
      //i had to but these here cause they will not get fetched if i didn't do this cause they are not cols so they will not just come with the findOne u have to get them as a relations
      relations: ['parent', 'children'],
    });

    if (!category) {
      throw new NotFoundException(`Category with slug '${slug}' not found`);
    }

    return category;
  }

  //Helpers
  private async checkUniqueConstraints(
    name: string,
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    await Promise.all([
      this.checkNameExists(name, excludeId),
      this.checkSlugExists(slug, excludeId),
    ]);
  }

  private async checkNameExists(
    name: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.categoriesRepo.findOne({ where: { name } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `Category with name '${name}' already exists`,
      );
    }
  }

  private async checkSlugExists(
    slug: string,
    excludeId?: string,
  ): Promise<void> {
    const existing = await this.categoriesRepo.findOne({ where: { slug } });
    if (existing && existing.id !== excludeId) {
      throw new ConflictException(
        `Category with slug '${slug}' already exists`,
      );
    }
  }

  private sortTreeChildren(categories: Categories[]): void {
    categories.forEach((category) => {
      if (category.children && category.children.length > 0) {
        category.children.sort((a, b) => {
          if (a.sortOrder !== b.sortOrder) {
            return a.sortOrder - b.sortOrder;
          }
          return a.name.localeCompare(b.name);
        });

        // Recursively sort grandchildren
        this.sortTreeChildren(category.children);
      }
    });
  }
}

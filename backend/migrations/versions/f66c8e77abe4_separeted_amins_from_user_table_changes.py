"""Separeted Amins from User Table changes

Revision ID: f66c8e77abe4
Revises: 3c852253ffdc
Create Date: 2023-11-05 17:07:07.901832

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f66c8e77abe4'
down_revision = '3c852253ffdc'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('admin', schema=None) as batch_op:
        batch_op.add_column(sa.Column('user_id', sa.Integer(), nullable=True))
        batch_op.drop_constraint('uq_admin_username', type_='unique')
        batch_op.create_foreign_key('fk_admin_user', 'user', ['user_id'], ['id'])
    # ...



def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('role')

    with op.batch_alter_table('admin', schema=None) as batch_op:
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.create_unique_constraint('uq_admin_username', ['username'])
        batch_op.drop_column('user_id')

    # ### end Alembic commands ###